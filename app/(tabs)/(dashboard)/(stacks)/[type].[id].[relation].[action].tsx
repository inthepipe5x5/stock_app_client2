import { actionType, ResourceType } from "@/components/navigation/ResourceActionSheet";
import supabase from "@/lib/supabase/supabase";
/** Page for performing an action on a resource 
 * @param id - @string - id of the resource
 * @param type - @string - type of the resource of @type ResourceType
 * @param action - @string - action to be performed on the resource of @type actionType
 * @param relation - @string - relation of the resource, ie. 'parent', 'child', 'sibling'
 * @returns - @JSX.Element - returns the resource detail page
*/


// const {data, error} = await supabase.from("*").select('*').eq('id', id)

// /(tabs)/[id]=1232134124124

// /(tabs)/(stacks)/[products].[id]=1232134124124

// const {data, error} = await supabase.from("products").select('*').eq('id', id)

// /products/
// /households 
// /inventories.[id].[action="read"

// user creates product 
// user takes photo of product => upload to supabase buckets and store url in database table 
// then on successful update, update the URI of the product image on the details page 
// user creates product => user is redirected to the product details page => user can see the product image and other details of the product
// user logs back in and sees product in inventory
// 