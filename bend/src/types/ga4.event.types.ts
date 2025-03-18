// Common Item export interface used across multiple events
export interface Item {
  item_id?: string; // One of item_id or item_name is required
  item_name?: string; // One of item_id or item_name is required
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
  // Additional custom parameters can be added (up to 27)
  [key: string]: string | number | boolean | undefined;
}

// ad_impression
export interface AdImpressionParams {
  ad_platform?: string;
  ad_source?: string;
  ad_format?: string;
  ad_unit_name?: string;
  currency?: string; // Required if value is set
  value?: number;
}

// add_payment_info
export interface AddPaymentInfoParams {
  currency: string; // Required if value is set
  value: number;
  coupon?: string;
  payment_type?: string;
  items: Item[];
}

// add_shipping_info
export interface AddShippingInfoParams {
  currency: string; // Required if value is set
  value: number;
  coupon?: string;
  shipping_tier?: string;
  items: Item[];
}

// add_to_cart
export interface AddToCartParams {
  currency: string; // Required if value is set
  value: number;
  items: Item[];
}

// add_to_wishlist
export interface AddToWishlistParams {
  currency: string; // Required if value is set
  value: number;
  items: Item[];
}

// begin_checkout
export interface BeginCheckoutParams {
  currency: string; // Required if value is set
  value: number;
  coupon?: string;
  items: Item[];
}

// campaign_details

export interface CampaignDetailsParams {
  campaign_id?: string; // The campaign id (e.g., google_1234)
  campaign?: string; // The name used to identify a specific promotion or strategic campaign
  source: string; // The campaign traffic source (e.g., google, email)
  medium: string; // The campaign medium (e.g., email, cost-per-click)
  term?: string; // The campaign term used with paid search to supply the keywords for ads
  content?: string; // The campaign content used for A/B testing and content-targeted ads
}

// close_convert_lead
export interface CloseConvertLeadParams {
  currency: string; // Required if value is set
  value: number;
}

// close_unconvert_lead
export interface CloseUnconvertLeadParams {
  currency: string; // Required if value is set
  value: number;
  unconvert_lead_reason?: string;
}

// disqualify_lead
export interface DisqualifyLeadParams {
  currency: string; // Required if value is set
  value: number;
  disqualified_lead_reason?: string;
}

// earn_virtual_currency
export interface EarnVirtualCurrencyParams {
  virtual_currency_name?: string;
  value?: number;
}

// generate_lead
export interface GenerateLeadParams {
  currency: string; // Required if value is set
  value: number;
  lead_source?: string;
}

// join_group
export interface JoinGroupParams {
  group_id?: string;
}

// level_up
export interface LevelUpParams {
  level?: number;
  character?: string;
}

// login
export interface LoginParams {
  method?: string;
}

// post_score
export interface PostScoreParams {
  score: number;
  level?: number;
  character?: string;
}

// purchase
export interface PurchaseParams {
  currency: string; // Required if value is set
  value: number;
  transaction_id: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
  items: Item[];
}

// qualify_lead
export interface QualifyLeadParams {
  currency: string; // Required if value is set
  value: number;
}

// remove_from_cart
export interface RemoveFromCartParams {
  currency: string; // Required if value is set
  value: number;
  items: Item[];
}

// screen_view
export interface ScreenViewParams {
  screen_class?: string;
  screen_name?: string;
}

// search
export interface SearchParams {
  search_term: string;
}

// select_content
export interface SelectContentParams {
  content_type?: string;
  content_id?: string;
}

// select_item
export interface SelectItemParams {
  item_list_id?: string;
  item_list_name?: string;
  items: Item[]; // Expected to have a single element
}

// select_promotion
export interface SelectPromotionParams {
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
  items?: Item[];
}

// Extended Item export interface for promotions
export interface PromotionItem extends Item {
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
}

// share
export interface ShareParams {
  method?: string;
  content_type?: string;
  item_id?: string;
}

// sign_up
export interface SignUpParams {
  method?: string;
}

// spend_virtual_currency
export interface SpendVirtualCurrencyParams {
  value: number;
  virtual_currency_name: string;
  item_name?: string;
}

export type TutorialBeginParams = never; // or Record<never, never>
export type TutorialCompleteParams = never; // or Record<never, never>

// unlock_achievement
export interface UnlockAchievementParams {
  achievement_id: string;
}

// view_cart
export interface ViewCartParams {
  currency: string; // Required if value is set
  value: number;
  items: Item[];
}

// view_item
export interface ViewItemParams {
  currency: string; // Required if value is set
  value: number;
  items: Item[];
}

// view_item_list
export interface ViewItemListParams {
  currency?: string; // Required if items have price
  item_list_id?: string;
  item_list_name?: string;
  items: Item[];
}

// view_promotion
export interface ViewPromotionParams {
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
  items: Item[]; // Expected to have a single element
}

// view_search_results
export interface ViewSearchResultsParams {
  search_term?: string;
}

// working_lead
export interface WorkingLeadParams {
  currency: string; // Required if value is set
  value: number;
  lead_status?: string;
}
