import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Upload, X, Users, BarChart3, Eye, Save, Search, Tag, ImageIcon } from "lucide-react";
import { z } from "zod";
import { useCallback, useMemo } from "react";

// Validation schema
const postSchema = z.object({
  title: z.string().trim().min(1, "العنوان مطلوب").max(200, "العنوان يجب أن يكون أقل من 200 حرف"),
  content: z.string().trim().min(1, "المحتوى مطلوب").max(50000, "المحتوى يجب أن يكون أقل من 50000 حرف"),
  excerpt: z.string().trim().max(500, "الملخص يجب أن يكون أقل من 500 حرف").optional().or(z.literal('')),
  image_url: z.string().url("يجب أن يكون رابط صحيح").optional().or(z.literal('')),
  category: z.string().min(1, "القسم مطلوب"),
  featured: z.boolean(),
  source: z.string().optional(),
  external_video_url: z.string().optional(),
  author_id: z.string().uuid().optional().nullable(),
  status: z.string(),
  scheduled_at: z.string().optional().nullable(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  slug: z.string().optional(),
});

const AdminPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalMediaInputRef = useRef<HTMLInputElement>(null);
  const authorImageInputRef = useRef<HTMLInputElement>(null);
  const [additionalMedia, setAdditionalMedia] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSEOPreview, setShowSEOPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "أخبار عدن",
    image_url: "",
    featured: false,
    source: "الجنوب فويس | خاص",
    external_video_url: "",
    author_id: null as string | null,
    status: "published",
    scheduled_at: "",
    meta_title: "",
    meta_description: "",
    slug: "",
  });

  // Author form state
  const [authorFormData, setAuthorFormData] = useState({
    name: "",
    image_url: "",
    bio: "",
  });

  const categories = [
    "أخبار عدن",
    "أخبار محلية",
    "أخبار وتقارير",
    "اليمن في الصحافة",
    "شؤون دولية",
    "اقتصاد",
    "آراء واتجاهات",
    "ثقافة وفن",
    "علوم وتكنولوجيا",
    "صحة",
    "رياضة",
    "منوعات",
    "فيديو",
    "عاجل"
  ];

  // Check auth and admin role
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: isAdminUser, error } = await supabase.rpc('is_admin');
    
    if (error || !isAdminUser) {
      toast.error("ليس لديك صلاحية الوصول للوحة التحكم");
      await supabase.auth.signOut();
      navigate("/admin/login");
      return;
    }

    setUser(session.user);
    setIsAdmin(true);
    setIsCheckingAuth(false);
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/admin/login");
      } else {
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, authors(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  // Fetch authors
  const { data: authors = [] } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  // Calculate word count and reading time
  const calculateWordStats = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // Average 200 words per minute
    return { wordCount, readingTime };
  };

  // Auto-generate tags from title and content
  const generateTags = (title: string, content: string) => {
    const text = `${title} ${content}`.toLowerCase();
    const commonWords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'أن', 'كان', 'بين', 'ما', 'لم', 'قد', 'بعد', 'قبل', 'أو', 'و', 'ال', 'إن', 'لا', 'إذا', 'كل', 'ذلك', 'أي', 'هو', 'هي', 'نحن', 'هم', 'أنت'];
    const words = text.split(/\s+/).filter(word => word.length > 3 && !commonWords.includes(word));
    const uniqueWords = [...new Set(words)].slice(0, 10);
    return uniqueWords;
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9-]/g, '')
      .substring(0, 100);
  };

  // Auto-save functionality
  const autoSaveDraft = useCallback(async () => {
    if (!autoSaveEnabled || !formData.title || formData.status !== 'draft') return;
    
    try {
      const { wordCount, readingTime } = calculateWordStats(formData.content);
      const tags = generateTags(formData.title, formData.content);
      
      const draftData = {
        ...formData,
        word_count: wordCount,
        reading_time: readingTime,
        tags,
        slug: formData.slug || generateSlug(formData.title),
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt || formData.content.substring(0, 160),
        scheduled_at: formData.scheduled_at || null,
        author_id: formData.author_id || null,
      };

      if (editingPost) {
        await supabase
          .from('posts')
          .update(draftData)
          .eq('id', editingPost.id);
      } else {
        const { data: newPost } = await supabase
          .from('posts')
          .insert([draftData])
          .select()
          .single();
        
        if (newPost) {
          setEditingPost(newPost);
        }
      }
      
      setLastAutoSave(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [formData, editingPost, autoSaveEnabled]);

  // Auto-save every 30 seconds for drafts
  useEffect(() => {
    if (!isDialogOpen || formData.status !== 'draft') return;
    
    const interval = setInterval(autoSaveDraft, 30000);
    return () => clearInterval(interval);
  }, [isDialogOpen, formData.status, autoSaveDraft]);

  // Filter posts by search
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter((post: any) => 
      post.title.includes(searchQuery) || 
      post.category.includes(searchQuery) ||
      post.content.includes(searchQuery)
    );
  }, [posts, searchQuery]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginated posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Calculate tags statistics
  const tagStats = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach((post: any) => {
      if (post.tags) {
        post.tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [posts]);

  // Calculate author performance
  const authorStats = useMemo(() => {
    const stats: Record<string, { name: string; posts: number; views: number }> = {};
    posts.forEach((post: any) => {
      if (post.author_id && post.authors) {
        if (!stats[post.author_id]) {
          stats[post.author_id] = { name: post.authors.name, posts: 0, views: 0 };
        }
        stats[post.author_id].posts++;
        stats[post.author_id].views += post.views || 0;
      }
    });
    return Object.values(stats).sort((a, b) => b.views - a.views);
  }, [posts]);

  // Create/Update post mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { wordCount, readingTime } = calculateWordStats(data.content);
      const tags = generateTags(data.title, data.content);
      
      const postData = {
        ...data,
        word_count: wordCount,
        reading_time: readingTime,
        tags,
        slug: data.slug || generateSlug(data.title),
        meta_title: data.meta_title || data.title,
        meta_description: data.meta_description || data.excerpt || data.content.substring(0, 160),
        scheduled_at: data.scheduled_at || null,
        author_id: data.author_id || null,
      };

      let postId = editingPost?.id;
      
      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        
        await supabase
          .from('post_media')
          .delete()
          .eq('post_id', editingPost.id);
      } else {
        const { data: newPost, error } = await supabase
          .from('posts')
          .insert([postData])
          .select()
          .single();
        if (error) throw error;
        postId = newPost.id;
      }
      
      if (additionalMedia.length > 0 && postId) {
        const mediaRecords = additionalMedia.map(media => ({
          post_id: postId,
          media_url: media.url,
          media_type: media.type,
          file_name: media.name
        }));
        
        const { error: mediaError } = await supabase
          .from('post_media')
          .insert(mediaRecords);
        
        if (mediaError) throw mediaError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(editingPost ? "تم تحديث الخبر بنجاح" : "تم إضافة الخبر بنجاح");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ");
    }
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success("تم حذف الخبر بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ");
    }
  });

  // Author mutations
  const saveAuthorMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAuthor) {
        const { error } = await supabase
          .from('authors')
          .update(data)
          .eq('id', editingAuthor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('authors')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast.success(editingAuthor ? "تم تحديث الكاتب بنجاح" : "تم إضافة الكاتب بنجاح");
      setIsAuthorDialogOpen(false);
      resetAuthorForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ");
    }
  });

  const deleteAuthorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast.success("تم حذف الكاتب بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      postSchema.parse(formData);
      saveMutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleAuthorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorFormData.name.trim()) {
      toast.error("اسم الكاتب مطلوب");
      return;
    }
    saveAuthorMutation.mutate(authorFormData);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      category: post.category,
      image_url: post.image_url || "",
      featured: post.featured || false,
      source: post.source || "الجنوب فويس | خاص",
      external_video_url: post.external_video_url || "",
      author_id: post.author_id || null,
      status: post.status || "published",
      scheduled_at: post.scheduled_at || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      slug: post.slug || "",
    });
    
    supabase
      .from('post_media')
      .select('*')
      .eq('post_id', post.id)
      .then(({ data }) => {
        if (data) {
          const mediaFiles = data.map(media => ({
            name: media.file_name || 'ملف',
            url: media.media_url,
            type: media.media_type
          }));
          setAdditionalMedia(mediaFiles);
        }
      });
    
    setIsDialogOpen(true);
  };

  const handleEditAuthor = (author: any) => {
    setEditingAuthor(author);
    setAuthorFormData({
      name: author.name,
      image_url: author.image_url || "",
      bio: author.bio || "",
    });
    setIsAuthorDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteAuthor = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الكاتب؟")) {
      deleteAuthorMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setUploadedFile(null);
    setAdditionalMedia([]);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "أخبار عدن",
      image_url: "",
      featured: false,
      source: "الجنوب فويس | خاص",
      external_video_url: "",
      author_id: null,
      status: "published",
      scheduled_at: "",
      meta_title: "",
      meta_description: "",
      slug: "",
    });
  };

  const resetAuthorForm = () => {
    setEditingAuthor(null);
    setAuthorFormData({
      name: "",
      image_url: "",
      bio: "",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة أو فيديو صالح");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 10 ميجابايت");
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      setUploadedFile({
        name: file.name,
        url: publicUrl,
        type: file.type.startsWith('video') ? 'video' : 'image'
      });

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("تم رفع الملف بنجاح");
    } catch (error: any) {
      toast.error(error.message || "فشل رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAuthorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة صالحة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `author-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      setAuthorFormData({ ...authorFormData, image_url: publicUrl });
      toast.success("تم رفع الصورة بنجاح");
    } catch (error: any) {
      toast.error(error.message || "فشل رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setFormData({ ...formData, image_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdditionalMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: Array<{ name: string; url: string; type: string }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/webm'];
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name}: نوع الملف غير مدعوم`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: حجم الملف يجب أن يكون أقل من 10 ميجابايت`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`${file.name}: فشل الرفع`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type.startsWith('video') ? 'video' : 'image'
        });
      }

      setAdditionalMedia([...additionalMedia, ...uploadedFiles]);
      toast.success(`تم رفع ${uploadedFiles.length} ملف بنجاح`);
    } catch (error: any) {
      toast.error(error.message || "فشل رفع الملفات");
    } finally {
      setIsUploading(false);
      if (additionalMediaInputRef.current) {
        additionalMediaInputRef.current.value = "";
      }
    }
  };

  const removeAdditionalMedia = (index: number) => {
    setAdditionalMedia(additionalMedia.filter((_, i) => i !== index));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // Calculate stats
  const totalPosts = posts.length;
  const featuredPosts = posts.filter((p: any) => p.featured).length;
  const totalViews = posts.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: posts.filter((p: any) => p.category === cat).length
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  if (isCheckingAuth || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-southGray">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-southBlue mb-4"></div>
          <p className="text-lg text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-southGray p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-southBlue">
              لوحة التحكم - <span className="text-accentRed">الجنوب فويس</span>
            </h1>
            <p className="text-gray-600 mt-1">مرحباً، {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")} variant="outline">
              عودة للموقع
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي الأخبار</p>
                  <p className="text-2xl font-bold text-southBlue">{totalPosts}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">الأخبار المميزة</p>
                  <p className="text-2xl font-bold text-accentRed">{featuredPosts}</p>
                </div>
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-green-600">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">عدد الكتّاب</p>
                  <p className="text-2xl font-bold text-purple-600">{authors.length}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="posts">إدارة الأخبار</TabsTrigger>
            <TabsTrigger value="authors">الكتّاب</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>إدارة الأخبار</CardTitle>
                      <CardDescription>إضافة وتعديل وحذف الأخبار</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) resetForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-southBlue hover:bg-southLight">
                          <Plus className="ml-2 h-4 w-4" />
                          إضافة خبر جديد
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingPost ? "تعديل الخبر" : "إضافة خبر جديد"}</DialogTitle>
                          <DialogDescription>
                            املأ البيانات التالية لنشر الخبر
                            {lastAutoSave && formData.status === 'draft' && (
                              <span className="text-green-600 mr-2">
                                (حُفظ تلقائياً: {lastAutoSave.toLocaleTimeString('ar-EG')})
                              </span>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">عنوان الخبر *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="source">نوع الخبر / المصدر</Label>
                            <Input
                              id="source"
                              value={formData.source}
                              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                              placeholder="الجنوب فويس | خاص"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="excerpt">ملخص الخبر</Label>
                          <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content">محتوى الخبر *</Label>
                          <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            rows={6}
                          />
                          <div className="text-xs text-gray-500">
                            {calculateWordStats(formData.content).wordCount} كلمة • {calculateWordStats(formData.content).readingTime} دقيقة للقراءة
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">القسم *</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status">حالة النشر</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">مسودة</SelectItem>
                                <SelectItem value="scheduled">مجدول</SelectItem>
                                <SelectItem value="published">منشور</SelectItem>
                                <SelectItem value="hidden">مخفي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {formData.category === "آراء واتجاهات" && (
                            <div className="space-y-2">
                              <Label htmlFor="author">الكاتب</Label>
                              <Select
                                value={formData.author_id || "_none"}
                                onValueChange={(value) => setFormData({ ...formData, author_id: value === "_none" ? null : value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الكاتب" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_none">بدون كاتب</SelectItem>
                                  {authors.map((author: any) => (
                                    <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {formData.status === "scheduled" && (
                          <div className="space-y-2">
                            <Label htmlFor="scheduled_at">تاريخ النشر المجدول</Label>
                            <Input
                              id="scheduled_at"
                              type="datetime-local"
                              value={formData.scheduled_at}
                              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="image_url">رابط الصورة الرئيسية</Label>
                          <div className="flex gap-2">
                            <Input
                              id="image_url"
                              value={formData.image_url}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              dir="ltr"
                              className="text-right flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="whitespace-nowrap"
                            >
                              <Upload className="ml-2 h-4 w-4" />
                              {isUploading ? "جاري الرفع..." : "رفع صورة"}
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                          {uploadedFile && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img src={uploadedFile.url} alt="معاينة" className="w-16 h-16 object-cover rounded" />
                                  <p className="text-xs text-green-600">{uploadedFile.name}</p>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={removeUploadedFile}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="external_video_url">رابط فيديو خارجي (YouTube, Facebook, TikTok, etc.)</Label>
                          <Input
                            id="external_video_url"
                            value={formData.external_video_url}
                            onChange={(e) => setFormData({ ...formData, external_video_url: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                            dir="ltr"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>رفع وسائط إضافية</Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => additionalMediaInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full"
                          >
                            <Upload className="ml-2 h-4 w-4" />
                            {isUploading ? "جاري الرفع..." : "رفع وسائط إضافية"}
                          </Button>
                          <input
                            ref={additionalMediaInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/mov,video/webm"
                            onChange={handleAdditionalMediaUpload}
                            multiple
                            className="hidden"
                          />
                          {additionalMedia.length > 0 && (
                            <div className="mt-2 grid grid-cols-4 gap-2">
                              {additionalMedia.map((media, index) => (
                                <div key={index} className="relative group">
                                  {media.type === 'video' ? (
                                    <video src={media.url} className="w-full h-20 object-cover rounded" />
                                  ) : (
                                    <img src={media.url} alt="معاينة" className="w-full h-20 object-cover rounded" />
                                  )}
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                    onClick={() => removeAdditionalMedia(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* SEO Section */}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-southBlue">إعدادات SEO</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSEOPreview(!showSEOPreview)}
                            >
                              {showSEOPreview ? "إخفاء المعاينة" : "معاينة SEO"}
                            </Button>
                          </div>
                          
                          {/* SEO Preview */}
                          {showSEOPreview && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">معاينة نتيجة البحث في Google:</p>
                              <div className="bg-white p-3 rounded border">
                                <p className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                                  {formData.meta_title || formData.title || "عنوان المقال"}
                                </p>
                                <p className="text-green-700 text-sm" dir="ltr">
                                  aljanoubvoice.com/post/{formData.slug || generateSlug(formData.title) || "slug"}
                                </p>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                  {formData.meta_description || formData.excerpt || formData.content.substring(0, 160) || "وصف المقال..."}
                                </p>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-4 mb-2">معاينة المشاركة على Facebook:</p>
                              <div className="bg-white rounded border overflow-hidden">
                                {formData.image_url && (
                                  <img src={formData.image_url} alt="معاينة" className="w-full h-40 object-cover" />
                                )}
                                <div className="p-3 bg-gray-100">
                                  <p className="text-xs text-gray-500 uppercase">aljanoubvoice.com</p>
                                  <p className="font-bold text-gray-900 truncate">
                                    {formData.meta_title || formData.title || "عنوان المقال"}
                                  </p>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {formData.meta_description || formData.excerpt || "وصف المقال..."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="meta_title">عنوان SEO (يُولّد تلقائياً)</Label>
                              <Input
                                id="meta_title"
                                value={formData.meta_title}
                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                placeholder={formData.title || "سيُؤخذ من العنوان"}
                              />
                              <p className="text-xs text-gray-500">{(formData.meta_title || formData.title || "").length}/60 حرف</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="meta_description">وصف SEO (يُولّد تلقائياً)</Label>
                              <Textarea
                                id="meta_description"
                                value={formData.meta_description}
                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                placeholder={formData.excerpt || "سيُؤخذ من الملخص"}
                                rows={2}
                              />
                              <p className="text-xs text-gray-500">{(formData.meta_description || formData.excerpt || "").length}/160 حرف</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="slug">الرابط الثابت Slug (يُولّد تلقائياً)</Label>
                              <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder={generateSlug(formData.title) || "سيُولّد من العنوان"}
                                dir="ltr"
                                className="text-right"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="featured" className="cursor-pointer">
                            خبر مميز (يظهر في السلايدر)
                          </Label>
                        </div>
                        
                        <Button type="submit" className="w-full bg-southBlue hover:bg-southLight">
                          {saveMutation.isPending ? "جاري الحفظ..." : (editingPost ? "تحديث الخبر" : "نشر الخبر")}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  </div>
                  {/* Search Field */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="بحث في الأخبار..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-southBlue"></div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد أخبار بعد. ابدأ بإضافة خبر جديد!"}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedPosts.map((post: any) => (
                        <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex gap-4">
                            {/* Thumbnail */}
                            <div className="flex-shrink-0">
                              {post.image_url ? (
                                <img 
                                  src={post.image_url} 
                                  alt={post.title}
                                  className="w-24 h-28 md:w-28 md:h-32 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-24 h-28 md:w-28 md:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col">
                              {/* Title Row with Actions */}
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-gray-900 text-base md:text-lg leading-snug line-clamp-3">
                                  {post.title}
                                </h3>
                                {/* Action Buttons */}
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleEdit(post)}
                                    className="h-9 w-9 p-0 border-gray-300"
                                  >
                                    <Pencil className="h-4 w-4 text-gray-600" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleDelete(post.id)}
                                    className="h-9 w-9 p-0 border-gray-300"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Badges Row */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">{post.category}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  post.status === 'published' ? 'bg-teal-100 text-teal-700' :
                                  post.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                  post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {post.status === 'published' ? 'منشور' :
                                   post.status === 'draft' ? 'مسودة' :
                                   post.status === 'scheduled' ? 'مجدول' : 'مخفي'}
                                </span>
                                {post.featured && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                    مميز
                                  </span>
                                )}
                                {post.category === 'عاجل' && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    عاجل
                                  </span>
                                )}
                              </div>
                              
                              {/* Excerpt */}
                              <p className="text-sm text-gray-500 mt-auto pt-2 line-clamp-2 leading-relaxed">
                                {post.excerpt || post.content?.substring(0, 100) + '...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <span>Previous</span>
                          <span className="sr-only">الصفحة السابقة</span>
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first, last, current, and adjacent pages
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-9 h-9 p-0 ${
                                    currentPage === page 
                                      ? "bg-gray-900 text-white hover:bg-gray-800" 
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  {page}
                                </Button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return <span key={page} className="px-1 text-gray-400">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="gap-1"
                        >
                          <span>Next</span>
                          <span className="sr-only">الصفحة التالية</span>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authors Tab */}
          <TabsContent value="authors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة الكتّاب</CardTitle>
                    <CardDescription>إضافة وتعديل الكتّاب لقسم آراء واتجاهات</CardDescription>
                  </div>
                  <Dialog open={isAuthorDialogOpen} onOpenChange={(open) => {
                    setIsAuthorDialogOpen(open);
                    if (!open) resetAuthorForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-southBlue hover:bg-southLight">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة كاتب جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingAuthor ? "تعديل الكاتب" : "إضافة كاتب جديد"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAuthorSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="author_name">اسم الكاتب *</Label>
                          <Input
                            id="author_name"
                            value={authorFormData.name}
                            onChange={(e) => setAuthorFormData({ ...authorFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>صورة الكاتب</Label>
                          <div className="flex items-center gap-4">
                            {authorFormData.image_url && (
                              <img src={authorFormData.image_url} alt="صورة الكاتب" className="w-16 h-16 rounded-full object-cover" />
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => authorImageInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              <Upload className="ml-2 h-4 w-4" />
                              {isUploading ? "جاري الرفع..." : "رفع صورة"}
                            </Button>
                            <input
                              ref={authorImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAuthorImageUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author_bio">نبذة عن الكاتب</Label>
                          <Textarea
                            id="author_bio"
                            value={authorFormData.bio}
                            onChange={(e) => setAuthorFormData({ ...authorFormData, bio: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-southBlue hover:bg-southLight">
                          {saveAuthorMutation.isPending ? "جاري الحفظ..." : (editingAuthor ? "تحديث" : "إضافة")}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {authors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا يوجد كتّاب بعد. ابدأ بإضافة كاتب جديد!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authors.map((author: any) => (
                      <Card key={author.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={author.image_url || "https://placehold.co/100x100/ccc/333?text=كاتب"} 
                              alt={author.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-southBlue">{author.name}</h4>
                              {author.bio && <p className="text-sm text-gray-500 line-clamp-2">{author.bio}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => handleEditAuthor(author)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteAuthor(author.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الأخبار حسب الأقسام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <span className="text-sm">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-southBlue rounded-full"
                              style={{ width: `${(cat.count / totalPosts) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-8">{cat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الأخبار الأكثر قراءة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {posts
                      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                      .slice(0, 5)
                      .map((post: any, index: number) => (
                        <div key={post.id} className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.title}</p>
                            <p className="text-xs text-gray-500">{post.views || 0} مشاهدة</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    أكثر الوسوم استخدامًا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tagStats.length > 0 ? (
                      tagStats.map(([tag, count]) => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                        >
                          #{tag}
                          <span className="bg-southBlue text-white text-xs px-1.5 rounded-full">{count}</span>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">لا توجد وسوم بعد</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    أداء الكتّاب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {authorStats.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الكاتب</TableHead>
                          <TableHead>عدد المقالات</TableHead>
                          <TableHead>إجمالي المشاهدات</TableHead>
                          <TableHead>متوسط المشاهدات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {authorStats.map((author) => (
                          <TableRow key={author.name}>
                            <TableCell className="font-medium">{author.name}</TableCell>
                            <TableCell>{author.posts}</TableCell>
                            <TableCell>{author.views.toLocaleString()}</TableCell>
                            <TableCell>{Math.round(author.views / author.posts).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد بيانات للكتّاب</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;