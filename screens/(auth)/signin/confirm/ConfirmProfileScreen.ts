import React, { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Controller, useForm } from 'react-hook-form';
import { GenericHookForm } from '@/components/forms/GenericHookForm';
import { GenericTextInput } from '@/components/forms/GenericTextInput';
import { Button } from '@/components/ui/button';
import { registerUserAndCreateProfile } from '@/lib/supabase/session';
import { newUserSchema } from '@/lib/schemas/authSchemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserSession } from '@/components/contexts/UserSessionProvider';
import defaultUserPreferences from '@/constants/userPreferences';

const ConfirmProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const {state, signIn} = useUserSession();
  const method = useForm({
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      preferences: defaultUserPreferences,
      created_at: new Date().toISOString(),
      app_metadata: {},
      provider: '',
      access_token: '',
      idToken: '',
      password: '',
      rememberme: false,
    },
    resolver: zodResolver(newUserSchema),
  });

  const onSubmit = (data: any/*z.infer<typeof newUserSchema>*/) => {
    registerUserAndCreateProfile(data);
  };

  // return (
  //   <GenericHookForm onSubmit={handleSubmit} formProps={{ zodResolver: newUserSchema }} PrimaryButtonProps={{ buttonText: 'Submit', onPress: () => { } }}>
  //     <VStack>
  //       <Controller
  //         name="user_id"
  //         control={control}
  //         render={({ field }) => (
  //           <GenericTextInput control={control} errors={{}} formProps={{ formName: 'user_id', formLabelText: 'User ID', formPlaceholder: 'Enter User ID' }} disabled={!isEditing} />
  //         )}
  //       />
  //       <Controller
  //         name="email"
  //         control={control}
  //         render={({ field }) => (
  //           <GenericTextInput control={control} errors={{}} formProps={{ formName: 'email', formLabelText: 'Email', formPlaceholder: 'Enter Email' }} disabled={!isEditing} />
  //         )}
  //       />
  //       <Controller
  //         name="name"
  //         control={control}
  //         render={({ field }) => (
  //           <GenericTextInput control={control} errors={{}} formProps={{ formName: 'name', formLabelText: 'Name', formPlaceholder: 'Enter Name' }} disabled={!isEditing} />
  //         )}
  //       />
  //       <Controller
  //         name="first_name"
  //         control={control}
  //         render={({ field }) => (
  //           <GenericTextInput control={control} errors={{}} formProps={{ formName: 'first_name', formLabelText: 'First Name', formPlaceholder: 'Enter First Name' }} disabled={!isEditing} />
  //         )}
  //       />
  //       <Controller
  //         name="last_name"
  //         control={control}
  //         render={({ field }) => (
  //           <GenericTextInput control={control} errors={{}} formProps={{ formName: 'last_name', formLabelText: 'Last Name', formPlaceholder: 'Enter Last Name' }} disabled={!isEditing} />
  //         )}
  //       />
  //       <Button onPress={() => setIsEditing(!isEditing)}>
  //         {isEditing ? 'Save' : 'Edit'}
  //       </Button>
  //       <Button onPress={() => {
  //         setIsEditing(!isEditing)
  //         onSubmit()

  //       }} disabled={!isEditing}>
  //         {isEditing ? 'Save' : 'Edit'}
  //       </Button>
  //     </VStack>
  //   </GenericHookForm>
  // );
};

export default ConfirmProfileScreen;
