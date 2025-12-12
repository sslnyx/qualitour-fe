// WordPress REST API Types

export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: any[];
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: WPUser[];
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: WPTerm[][];
  };
}

export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: any[];
  _embedded?: {
    author?: WPUser[];
    'wp:featuredmedia'?: WPMedia[];
  };
}

export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [key: string]: string;
  };
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: 'image' | 'file' | 'video';
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
  };
  source_url: string;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category';
  parent: number;
}

export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'post_tag';
}

export type WPTerm = WPCategory | WPTag;

// Tour-specific types

export interface WPTourCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'tour_category';
  parent: number;
}

export interface WPTourTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'tour_tag';
}

export interface WPTourImageSizes {
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  medium?: {
    url: string;
    width: number;
    height: number;
  };
  large?: {
    url: string;
    width: number;
    height: number;
  };
  full?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface WPTourMeta {
  price?: string;
  original_price?: string;
  has_discount?: boolean;
  discount_percent?: number;
  duration?: string;
  duration_text?: string;
  min_people?: string;
  max_people?: string;
  location?: string;
  country?: string;
  rating?: string | {
    score: number;
    reviewer: number;
  };
  review_count?: string;
  // Tourmaster discount pricing fields
  'tour-price-text'?: string;           // Original price
  'tour-price-discount-text'?: string;  // Discounted price
  'tourmaster-tour-discount'?: string;  // 'true' if discount active
  // Custom headless fields
  is_featured?: boolean;
  badge_text?: string;
  // Allow additional dynamic fields from WordPress
  [key: string]: any;
}

// GoodLayers Page Builder Types (Optimized)

export interface GoodLayersElementValue {
  id?: string;
  class?: string;
  [key: string]: any; // Page builder elements have many dynamic properties
}

export interface GoodLayersElement {
  template: 'element';
  type: string; // title, text-box, icon-list, gallery, toggle-box, divider, etc.
  value: GoodLayersElementValue;
}

export interface GoodLayersWrapper {
  template: 'wrapper';
  type: 'background' | 'column';
  value: {
    id?: string;
    class?: string;
    'content-layout'?: string;
    padding?: any;
    margin?: any;
    'background-type'?: string;
    'background-color'?: string;
    skin?: string;
    [key: string]: any;
  };
  items: (GoodLayersElement | GoodLayersColumn)[];
}

export interface GoodLayersColumn {
  template: 'wrapper';
  type: 'column';
  value: {
    id?: string;
    class?: string;
    column?: string;
    [key: string]: any;
  };
  items: GoodLayersElement[];
}

export interface GoodLayersItineraryDay {
  'head-text': string;
  title: string;
  content: string;
  active?: string;
}

/**
 * Optimized GoodLayers data structure
 * - Only includes 'sections' (simplified page_builder) on single tour requests
 * - Omits all page_builder data on list requests to reduce payload
 */
export interface GoodLayersData {
  // Simplified page builder - only relevant sections (overview, detail, itinerary, etc.)
  sections?: {
    template: string;
    type: string;
    value: {
      id: string;
      class?: string;
    };
    items: any[];
  }[];
  
  // Tour-specific Tourmaster fields (only on single requests)
  tour_overview?: string;
  tour_highlight?: string;
  tour_include?: string;
  tour_exclude?: string;
  tour_itinerary?: GoodLayersItineraryDay[] | string;
  tour_faq?: any;
  tour_terms?: string;
}

export interface WPTour {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: 'tour';
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: any[];
  tour_category: number[];
  tour_tag: number[];
  'tour-activity'?: number[];
  'tour-destination'?: number[];
  'tour-activity_exclude'?: number[];
  'tour-destination_exclude'?: number[];
    // Custom fields added by our plugin
    acf_fields?: { [key: string]: any };
  featured_image_url?: WPTourImageSizes;
  tour_meta?: WPTourMeta;
  goodlayers_data?: GoodLayersData;
  _embedded?: {
    author?: WPUser[];
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: (WPTourCategory[] | WPTourTag[])[];
  };
}

export interface WPApiParams {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  author?: number | number[];
  author_exclude?: number | number[];
  before?: string;
  exclude?: number | number[];
  include?: number | number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'author' | 'date' | 'id' | 'include' | 'modified' | 'parent' | 'relevance' | 'slug' | 'title';
  slug?: string | string[];
  status?: string;
  categories?: number | number[];
  categories_exclude?: number | number[];
  tags?: number | number[];
  tags_exclude?: number | number[];
  sticky?: boolean;
  _embed?: boolean;
  _fields?: string; // Comma-separated list of fields to return (reduces payload size)
  // Tour-specific params
  tour_category?: number | number[];
  tour_category_exclude?: number | number[];
  tour_tag?: number | number[];
  tour_tag_exclude?: number | number[];
  'tour-activity'?: number | number[];
  'tour-activity_exclude'?: number | number[];
  'tour-destination'?: number | number[];
  'tour-destination_exclude'?: number | number[];
  // Polylang language parameter
  lang?: string;
}

export interface WPTourActivity {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'tour-activity';
  parent: number;
}

export interface WPTourDestination {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'tour-destination';
  parent: number;
  meta?: any[];
  acf?: any[];
  _links?: any;
}

// Google Reviews (synced from SerpAPI via WordPress plugin)
export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  images?: string[];
  local_guide?: boolean;
  reviewer_reviews?: number;
  reviewer_photos?: number;
}

export interface PlaceDetails {
  name?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
  url?: string;
  website?: string;
}
