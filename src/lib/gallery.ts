export const GALLERY_FOLDERS = {
    "church-life":
      "gcc/gallery/churchlife",
  
    "local-missions":
      "gcc/gallery/localmissions",
  
    "international-missions":
      "gcc/gallery/internationalmissions",
  
    "youth":
      "gcc/gallery/youthnkids",
  } as const;
  
  export type GalleryCategory =
    keyof typeof GALLERY_FOLDERS;