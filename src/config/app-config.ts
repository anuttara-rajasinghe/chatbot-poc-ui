// Centralized configuration for all customizable UI labels and settings
export const APP_CONFIG = {
  // App branding
  APP_NAME: "AI Assistant",
  APP_DESCRIPTION: "Your intelligent chat companion",
  
  // Chat interface labels
  CHAT: {
    WELCOME_TITLE: "Hi there! 👋",
    WELCOME_MESSAGE: "How can I help?",
    INPUT_PLACEHOLDER: "Ask anything...",
    SEND_BUTTON: "Send",
    NEW_CHAT: "New Chat",
    CHAT_HISTORY: "Chat History",
    LOADING_MESSAGE: "Thinking...",
    ERROR_MESSAGE: "Something went wrong. Please try again.",
    EMPTY_HISTORY: "No conversations yet",
    DELETE_CHAT: "Delete Chat",
  },
  
  // Admin portal labels
  ADMIN: {
    TITLE: "Admin Portal",
    DOCUMENTS_TITLE: "Document Management",
    UPLOAD_BUTTON: "Upload Documents",
    SEARCH_PLACEHOLDER: "Search documents...",
    ADD_DOCUMENT: "Add Document",
    DELETE_DOCUMENT: "Delete",
    EDIT_DOCUMENT: "Edit",
    DOCUMENT_STATUS: {
      PROCESSING: "Processing",
      READY: "Ready",
      FAILED: "Failed"
    },
    LOGIN_TITLE: "Admin Login",
    LOGIN_BUTTON: "Login with Auth0",
    LOGOUT_BUTTON: "Logout",
    UPLOAD_SUCCESS: "Documents uploaded successfully",
    UPLOAD_ERROR: "Failed to upload documents",
    DELETE_SUCCESS: "Document deleted successfully",
    DELETE_ERROR: "Failed to delete document",
    NO_DOCUMENTS: "No documents found",
  },
  
  // Navigation labels
  NAVIGATION: {
    CHAT: "Chat",
    ADMIN: "Admin",
    SETTINGS: "Settings",
    HOME: "Home",
  },
  
  // API endpoints (customizable for white-labeling)
  API: {
    CHAT_ENDPOINT: "/api/chat",
    SESSION_ENDPOINT: "/api/session",
    UPLOAD_ENDPOINT: "/api/upload",
    DOCUMENTS_ENDPOINT: "/api/documents",
  },
  
  // Theme settings
  THEME: {
    DEFAULT_MODE: "dark",
    ENABLE_THEME_TOGGLE: true,
    PRIMARY_COLOR: "262 83% 58%", // Purple from the image
    SECONDARY_COLOR: "220 84% 65%", // Blue from the image
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_CHAT_EXPORT: true,
    ENABLE_DOCUMENT_PREVIEW: true,
    ENABLE_SEARCH: true,
    ENABLE_FILE_UPLOAD: true,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: [".pdf", ".txt", ".doc", ".docx"],
  },
  
  // Powered by branding (customizable for white-labeling)
  BRANDING: {
    POWERED_BY: "ARIA",
    SHOW_POWERED_BY: true,
    LOGO_URL: null, // Custom logo URL
    FAVICON_URL: null, // Custom favicon URL
  }
} as const;

// Type for the configuration
export type AppConfig = typeof APP_CONFIG;