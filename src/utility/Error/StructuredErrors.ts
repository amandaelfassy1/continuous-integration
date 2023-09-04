export type StructuredErrors = 
  // SQL
  'sql/failed' |  
  'sql/not-found' |

  // Crud
  'validation/failed' | 
    
  // Authorization
  'auth/missing-email' |
  'auth/unknown-email' |
  'auth/missing-magic-link-token' |
  'auth/invalid-magic-link-token' |
  'auth/missing-header' |
  'auth/access-token-expired' |
  'auth/invalid-access-token' |

  // Fichiers
  'object/invalid-multipart' |
  'object/invalid-response' |
  'object/key-not-found-in-storage' |

  // Advertising
  'advertiser/insufficient-credit' |

  // Default
  'internal/unknown'
;