// import React, { useState } from 'react';
// import { VStack } from '@/components/ui/vstack';
// import { Controller, useForm } from 'react-hook-form';
// import { GenericHookForm } from '@/components/forms/GenericHookForm';
// import { GenericTextInput } from '@/components/forms/GenericTextInput';
// import { Button } from '@/components/ui/button';
// import { registerUserAndCreateProfile, upsertUserProfile } from '@/lib/supabase/session';
// import { newUserSchema,  } from '@/lib/schemas/authSchemas';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useUserSession } from '@/components/contexts/UserSessionProvider';
// import defaultUserPreferences from '@/constants/userPreferences';
// import { pick, remapKeys } from '@/utils/pick';
// import { userProfile } from '@/constants/defaultSession';
// import { convertCamelToSnake } from '@/utils/caseConverter';
// import supabase from '@/lib/supabase/supabase';
// import isTruthy from '@/utils/isTruthy';

// //New User Form Sections

// const userDetailsSection = {
//   email: '',
//   firstName: '',
//   lastName: '',
//   phoneNumber: '',
// };

// const authenticationMethod = {
//   password: '',
//   confirmPassword: "",
//   provider: '',
//   access_token: '',
//   id_token: '',
//   refresh_token: '',
// };

// const location = {
//   city: '',
//   state: '',
//   country: '',
//   postalcode: '',
// };

// const preferences = defaultUserPreferences;

// //this is the hidden metadata section
// //eg. update the user_id, created_at, and app_metadata fields (which are hidden from the user) while the user goes through the form
// const hiddenMetaSection = {
//   user_id: '',
//   created_at: new Date().toISOString(),
//   app_metadata: {},
// };

// const emptyUserProfileDraft = {
//   ...userDetailsSection,
//   ...authenticationMethod,
//   ...location,
//   preferences,
//   ...{meta: hiddenMetaSection},
// };

// const formSectionSteps = [Object.keys(userDetailsSection), Object.keys(authenticationMethod), Object.keys(location), Object.keys(preferences)].reduce((acc, section, index) => {
//   acc[`section${index+1}`] = section;
//   return acc;
// }, {} as {[key: string]: string[]});


// const ConfirmProfileScreen = () => {
//   const {state, dispatch, signIn} = useUserSession();
//   const [isEditing, setIsEditing] = useState(false);
//   const schema = newUserSchema;

//   // const method = useForm({
//   //   defaultValues: emptyUserProfileDraft,
//   //   resolver: zodResolver(schema),
//   // });

//   type finalSubmitType = (data: Partial<userProfile> & {password: string}) => void; 

//   const finalSubmit = async (data: finalSubmitType/*z.infer<typeof newUserSchema>*/) => {


//     const keyMapping = Object.keys(data).reduce((acc, key) => {
//       acc[key] = convertCamelToSnake(key);
//       return acc;
//     }, {} as { [key: string]: string });

//     const userData = remapKeys(data, keyMapping);

//     // // registerUserAndCreateProfile(userData, dispatch, signIn);
//     // upsertUserProfile(userData, dispatch, signIn);
//    const newProfile = await supabase.from("profiles").upsert(userData, {onConflict: "user_id", ignoreDuplicates: false});

//    //throw any errors
//    if (isTruthy(newProfile.error)) {
//       console.error(newProfile.error);
//       throw newProfile.error;
//     }

//     //dispatch the new profile
//     dispatch({type: 'UPDATE_USER', payload: newProfile?.data ?? {}});
//   };

//   const nameInputElements = ({methods, defaultValues}: any) => {

//     const {control, handleSubmit, formState: {errors}, getValues} = methods;



//   };



// }

// export default ConfirmProfileScreen;
import SubmitButton from "@/components/navigation/SubmitButton";
import Footer from "@/components/navigation/Footer";
import { ThemedView, ThemedViewProps } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import ProfileEditScreen from "@/screens/(tabs)/profile/ProfileEditScreen";
import { useState } from "react";
import { useAuth } from "@/components/contexts/authContext";
import { upsertUserProfile } from "@/lib/supabase/session";

const ConfirmProfileScreen = () => {
  const authContext = useAuth();
  const { form } = authContext || {};



  return (
    <ThemedView
      className="flex-1 justify-around items-center p-4"
    // style={{ backgroundColor: "#F5F5F5" }}
    >

      <Text className="text-typography-700 text-sm font-semibold" >
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </Text>
      <SubmitButton
        focusRef={authContext?.submitBtnRef}
        btnText="Continue"
        onSubmit={() => authContext.handleFinalFormSubmit(async (data) => { }, '/(tabs)/(profile)')}

        disabled={authContext?.form.formState.isSubmitting}
        cnStyles={{ btn: "mb-4" }}
      />
    </ThemedView>

  );
}
export default () => ProfileEditScreen;