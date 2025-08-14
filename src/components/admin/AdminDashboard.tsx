import { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  Search, 
  Trash2, 
  FileText, 
  Download,
  Settings,
  ArrowLeft,
  LogOut,
  User
} from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import AdminLogin from '../auth/AdminLogin';

interface Document {
  id: string;
  name: string;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  content: string | null;
  status: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery]);

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  // Show loading spinner while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
      return;
    }

    setDocuments(data || []);
  };

  const filterDocuments = () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!APP_CONFIG.FEATURES.ALLOWED_FILE_TYPES.includes(fileExtension as any)) {
          toast({
            title: "Invalid File Type",
            description: `File type ${fileExtension} is not allowed`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size
        if (file.size > APP_CONFIG.FEATURES.MAX_FILE_SIZE) {
          toast({
            title: "File Too Large",
            description: `File ${file.name} exceeds maximum size limit`,
            variant: "destructive",
          });
          continue;
        }

        // Create document record
        const { error } = await supabase
          .from("documents")
          .insert([
            {
              name: file.name,
              file_size: file.size,
              file_type: fileExtension,
              status: "processing",
              content: null, // In real implementation, you'd process the file content
            },
          ]);

        if (error) {
          console.error("Error uploading document:", error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: APP_CONFIG.ADMIN.UPLOAD_SUCCESS,
      });

      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: APP_CONFIG.ADMIN.UPLOAD_ERROR,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const deleteDocument = async (documentId: string) => {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: APP_CONFIG.ADMIN.DELETE_ERROR,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: APP_CONFIG.ADMIN.DELETE_SUCCESS,
    });

    loadDocuments();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen admin-background">
      <div className="container mx-auto p-6">
        {/* Header with user info and logout */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user?.name || user?.email}</h2>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {APP_CONFIG.ADMIN.LOGOUT_BUTTON}
          </Button>
        </div>

        {/* Title and Upload Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {APP_CONFIG.ADMIN.TITLE}
            </h1>
            <p className="text-muted-foreground mt-1">
              {APP_CONFIG.ADMIN.DOCUMENTS_TITLE}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept={APP_CONFIG.FEATURES.ALLOWED_FILE_TYPES.join(",")}
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button 
                className="gradient-primary text-white shadow-glow cursor-pointer"
                disabled={isUploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : APP_CONFIG.ADMIN.UPLOAD_BUTTON}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Search */}
        <Card className="admin-card border-border mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={APP_CONFIG.ADMIN.SEARCH_PLACEHOLDER}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="admin-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Documents ({filteredDocuments.length})</span>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "No matching documents" : APP_CONFIG.ADMIN.NO_DOCUMENTS}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search criteria"
                    : "Upload your first document to get started"
                  }
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{document.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{document.file_type?.toUpperCase()}</span>
                            <span>{formatFileSize(document.file_size)}</span>
                            <span>{new Date(document.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(document.status)}>
                          {APP_CONFIG.ADMIN.DOCUMENT_STATUS[
                            document.status.toUpperCase() as keyof typeof APP_CONFIG.ADMIN.DOCUMENT_STATUS
                          ] || document.status}
                        </Badge>
                        
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Powered by footer */}
        {APP_CONFIG.BRANDING.SHOW_POWERED_BY && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Powered by {APP_CONFIG.BRANDING.POWERED_BY}
          </div>
        )}
      </div>
    </div>
  );
};