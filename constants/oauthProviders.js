import { GoogleIcon } from "../assets/icons/google/index.tsx";
import { Apple } from "lucide-react-native";
import { Email } from "lucide-react-native";
import { Facebook } from "../assets/icons/facebook/facebook";

const authProviders = Object.freeze({
  EMAIL: { slug: "email", name: "email", icon: Email }, //for users who use magic link via email
  SOCIAL: {
    GOOGLE: { slug: "google", name: "Google", icon: GoogleIcon },
    APPLE: { slug: "apple", name: "Apple", icon: Apple },
    FACEBOOK: { slug: "facebook", name: "Facebook", icon: Facebook },
  },
});

class AuthProviderMapper {
  static providerEnum = authProviders;

  //get a specific provider by slug
  static getProvider(slug) {
    if (!slug || typeof slug !== "string") {
      throw new Error("Invalid provider slug for look up");
    }
    return this.providers[slug];
  }

  /**
   * The function `providers` returns an array of provider slugs from a nested object structure.
   * @param [asObj=false] - The `asObj` parameter in the `providers` method is a boolean flag that
   * determines whether the method should return an array of provider objects or an array of provider
   * slugs. If `asObj` is set to `true`, the method will return an array of provider objects. If `as
   * @returns The `providers` method returns an array of provider slugs if the `asObj` parameter is set
   * to `false`, and it returns an array of provider objects if the `asObj` parameter is set to `true`.
   */
  static providers(asObj = false) {
    const flattenProviders = (obj) => {
      return Object.values(obj).reduce((acc, val) => {
        if (typeof val === "object" && !Array.isArray(val)) {
          acc.push(...flattenProviders(val));
        } else {
          acc.push(val);
        }
        return acc;
      }, []);
    };

    const providersArray = flattenProviders(this.providerEnum);

    return asObj
      ? providersArray
      : providersArray.map((provider) => provider?.slug);
  }
}

export { authProviders, AuthProviderMapper };
