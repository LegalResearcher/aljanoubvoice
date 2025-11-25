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
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Upload, X } from "lucide-react";
import { z } from "zod";

// Validation schema
const postSchema = z.object({
  title: z.string().trim().min(1, "العنوان مطلوب").max(200, "العنوان يجب أن يكون أقل من 200 حرف"),
  content: z.string().trim().min(1, "المحتوى مطلوب").max(50000, "المحتوى يجب أن يكون أقل من 50000 حرف"),
  excerpt: z.string().trim().max(500, "الملخص يجب أن يكون أقل من 500 حرف").optional().or(z.literal('')),
  image_url: z.string().url("يجب أن يكون رابط صحيح").optional().or(z.literal('')),
  category: z.string().min(1, "القسم مطلوب"),
  featured: z.boolean()
});

const AdminPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalMediaInputRef = useRef<HTMLInputElement>(null);
  const [additionalMedia, setAdditionalMedia] = useState<Array<{ name: string; url: string; type: string }>>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "أخبار عدن",
    image_url: "",
    featured: false,
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
    "فيديو"
  ];

  // Check auth and admin role
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    // Check if user has admin role
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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  // Create/Update post mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      let postId = editingPost?.id;
      
      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(data)
          .eq('id', editingPost.id);
        if (error) throw error;
        
        // Delete old additional media
        await supabase
          .from('post_media')
          .delete()
          .eq('post_id', editingPost.id);
      } else {
        const { data: newPost, error } = await supabase
          .from('posts')
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        postId = newPost.id;
      }
      
      // Insert additional media
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      postSchema.parse(formData);
      saveMutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
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
    });
    
    // Fetch existing additional media for this post
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

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
      deleteMutation.mutate(id);
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
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة أو فيديو صالح");
      return;
    }

    // Validate file size (max 10MB)
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

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/webm'];
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name}: نوع الملف غير مدعوم`);
          continue;
        }

        // Validate file size (max 10MB)
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

        <Card className="mb-8">
          <CardHeader>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPost ? "تعديل الخبر" : "إضافة خبر جديد"}</DialogTitle>
                    <DialogDescription>
                      املأ البيانات التالية لنشر الخبر
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">عنوان الخبر</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
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
                      <Label htmlFor="content">محتوى الخبر</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">القسم</Label>
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
                      <Label htmlFor="image_url">رابط الصورة أو الفيديو</Label>
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
                          {isUploading ? "جاري الرفع..." : "رفع صورة/فيديو"}
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
                              {uploadedFile.type === 'video' ? (
                                <video src={uploadedFile.url} className="w-16 h-16 object-cover rounded" />
                              ) : (
                                <img src={uploadedFile.url} alt="معاينة" className="w-16 h-16 object-cover rounded" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  {uploadedFile.type === 'video' ? '🎥 فيديو' : '📷 صورة'}
                                </p>
                                <p className="text-xs text-green-600">{uploadedFile.name}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeUploadedFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>رفع وسائط إضافية (صور / فيديوهات)</Label>
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
                        <div className="mt-2 space-y-2">
                          {additionalMedia.map((media, index) => (
                            <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {media.type === 'video' ? (
                                  <video src={media.url} className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <img src={media.url} alt="معاينة" className="w-12 h-12 object-cover rounded" />
                                )}
                                <div>
                                  <p className="text-xs font-medium text-blue-800">
                                    {media.type === 'video' ? '🎥 فيديو' : '📷 صورة'}
                                  </p>
                                  <p className="text-xs text-blue-600">{media.name}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAdditionalMedia(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-southBlue"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد أخبار بعد. ابدأ بإضافة خبر جديد!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>مميز</TableHead>
                    <TableHead>تاريخ النشر</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>{post.featured ? "✓" : "-"}</TableCell>
                      <TableCell>
                        {new Date(post.created_at).toLocaleDateString('ar-YE')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;