-- This SQL script creates a function to insert a new template household and its associated template inventories
CREATE
OR REPLACE FUNCTION public.insert_templated_household_and_inventories (new_user_id UUID) RETURNS TABLE (household_id UUID, inventory_id UUID) AS $$
DECLARE
    template_household RECORD;
    new_household_id UUID;
BEGIN
    -- Select the template household
    SELECT
        th.name,
        th.description,
        th.initial_template_name,
        th.styling,
        th.media
    INTO template_household
    FROM public.households AS th
    WHERE
        th.is_template = TRUE
        AND th.draft_status = 'published'
        AND th.initial_template_name = 'Type-Based Household'
    LIMIT 1;

    -- Insert into public.households
    INSERT INTO public.households (
        id,
        name,
        description,
        initial_template_name,
        styling,
        is_template,
        draft_status
    ) VALUES (
        gen_random_uuid(),
        template_household.name,
        template_household.description,
        template_household.initial_template_name,
        template_household.styling,
        FALSE,  -- Set is_template to FALSE for the new household
        'draft' -- Set draft_status to 'draft' for the new household
    )
    RETURNING id INTO new_household_id;

    -- Insert into user_households
    INSERT INTO public.user_households (
        household_id,
        user_id,
        access_level,
        invited_by,
        invited_at,
        invite_accepted,
        invite_expires_at
    ) VALUES (
        new_household_id,
        new_user_id,
        'manager',  -- Assuming the user is a manager by default
        NULL,       -- invited_by can be NULL for the manager
        NOW(),      -- invited_at is the current timestamp
        TRUE,       -- invite_accepted is TRUE for the owner
        NULL        -- invite_expires_at can be NULL for the owner
    )
    ON CONFLICT (user_id, household_id) DO NOTHING;

    -- Insert inventories associated with the household
    IF new_household_id IS NOT NULL THEN
        INSERT INTO public.inventories (
            id,
            name,
            description,
            category,
            styling,
            household_id
        )
        SELECT
            gen_random_uuid() AS id,
            inv.name,
            inv.description,
            inv.category,
            inv.styling,
            new_household_id
        FROM public.inventories AS inv
        WHERE
            inv.is_template = TRUE
            AND inv.draft_status = 'published'
            AND inv.household_id = (
                SELECT h.id
                FROM public.households AS h
                WHERE
                    h.is_template = TRUE
                    AND h.draft_status = 'published'
                    AND h.initial_template_name = 'Type-Based Household'
            )
        ON CONFLICT (name) DO NOTHING
        RETURNING id INTO inventory_id;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to call the insert_templated_household_and_inventories function upon new auth.user & public.profiles row insertion
BEGIN
INSERT INTO
    public.profiles (user_id, email, created_at, app_metadata)
VALUES
    (
        NEW.id,
        NEW.email,
        NEW.created_at,
        JSONB_BUILD_OBJECT(
            'is_sso_user',
            NEW.raw_app_meta_data ->> 'is_sso_user',
            'is_super_user',
            NEW.raw_app_meta_data ->> 'is_super_user',
            'is_deleted',
            NEW.raw_app_meta_data ->> 'is_deleted'
        )
    );

-- Call the function to insert templated households and inventories
PERFORM public.insert_templated_household_and_inventories (NEW.id);

-- Log the new user creation
RAISE LOG 'A new user was created: %',
NEW.id;

RETURN NEW;

END;