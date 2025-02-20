import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Controller, useForm } from 'react-hook-form';
import { GenericHookForm } from '@/components/forms/GenericHookForm';
import { GenericTextInput } from '@/components/forms/GenericTextInput';
import { Button } from '@/components/ui/button';
import { registerUserAndCreateProfile } from '@/lib/supabase/session';
import { userProfile } from '@/constants/defaultSession';
import { newUserSchema } from '@/lib/schemas/authSchemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ConfirmProfileScreen = (props: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      user_id: '',
      email: '',
      name: '',
      first_name: '',
      last_name: '',
      preferences: {},
      created_at: '',
      app_metadata: {},
      provider: '',
      access_token: '',
      idToken: '',
      password: '',
      rememberme: false,
    },
    resolver: zodResolver(newUserSchema),
  });

  const onSubmit = (data: z.infer<typeof newUserSchema>) => {
    registerUserAndCreateProfile(data);
  };

  return (
    <GenericHookForm onSubmit={onSubmit}>
      <VStack>
        <Controller
          name="user_id"
          control={control}
          render={({ field }) => (
            <GenericTextInput {...field} label="User ID" disabled={!isEditing} />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <GenericTextInput {...field} label="Email" disabled={!isEditing} />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <GenericTextInput {...field} label="Name" disabled={!isEditing} />
          )}
        />
        <Controller
          name="first_name"
          control={control}
          render={({ field }) => (
            <GenericTextInput {...field} label="First Name" disabled={!isEditing} />
          )}
        />
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <GenericTextInput {...field} label="Last Name" disabled={!isEditing} />
          )}
        />
        {/* Add other fields similarly */}
        <Button onPress={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Save' : 'Edit'}
        </Button>
      </VStack>
    </GenericHookForm>
  );
};

export default ConfirmProfileScreen;