//TODO: delete this redundant file later

// import { GenericHookForm } from "./GenericHookForm";
// import { useAuth } from "../contexts/authContext";
// import { GenericTextInput } from "./GenericTextInput";

// interface AuthFormProps {
//   showSSoProviders: boolean; //boolean state from page level state or router.showOptions
//   zodSchema: any; // zod schema for form validation
//   onSubmit: (values: any) => void;

// }

// const AuthForm = (showSSoProviders: boolean) => {
//   return (
//     <GenericHookForm
//       formProps={{
//         zodResolver: zodSchema,
//         defaultValues: {},
//         delayError: 1000,
//         resetOptions: {},
//       }}
//       PrimaryButtonProps={{
//         onPress: () => {},
//         childInputElements: () => {
//           return (
//             <>
//               <TextInput
//                 name="email"
//                 label="Email"
//                 type="email"
//                 placeholder="Email"
//                 required
//               />
//               <TextInput
//                 name="password"
//                 label="Password"
//                 type="password"
//                 placeholder="Password"
//                 required
//               />
//             </>
//           );
//         },
//         buttonText: "Submit",
//       }}
//       onSubmit={onSubmit}
//       childInputElements={(methods) => {
//         return (
//           <>
//             <TextInput
//               name="email"
//               label="Email"
//               type="email"
//               placeholder="Email"
//               required
//             />
//             <TextInput
//               name="password"
//               label="Password"
//               type="password"
//               placeholder="Password"
//               required
//             />
//           </>
//         );
//       }}
//     />
//   );
// };
