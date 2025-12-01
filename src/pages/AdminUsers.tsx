import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Users, Shield, ArrowRight } from "lucide-react";
import { z } from "zod";

// Validation schema
const userSchema = z.object({
  email: z.string().trim().email("الرجاء إدخال بريد إلكتروني صحيح").max(255),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100),
  role: z.enum(["admin", "editor"], { required_error: "الرجاء اختيار الدور" })
});

const updatePasswordSchema = z.object({
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100),
});

interface UserWithRole {
  id: string;
  email: string;
  role: "admin" | "editor";
  created_at: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [isEditMyDataOpen, setIsEditMyDataOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "editor" as "admin" | "editor",
  });
  
  // My data form state
  const [myDataForm, setMyDataForm] = useState({
    email: "",
    password: "",
  });

  // Check auth and admin role
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: isAdminUser, error } = await supabase.rpc('is_admin');
    
    if (error || !isAdminUser) {
      toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      navigate("/admin");
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

  // Fetch users with roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (rolesError) throw rolesError;
      
      // Map roles to users format
      const usersWithRoles: UserWithRole[] = userRoles.map(role => ({
        id: role.user_id,
        email: "", // Will be populated from auth
        role: role.role as "admin" | "editor",
        created_at: role.created_at || ""
      }));
      
      return usersWithRoles;
    },
    enabled: isAdmin
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; role: "admin" | "editor" }) => {
      // Create user via Supabase Auth admin functions
      // Note: This requires service role, so we'll use signUp for now
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("فشل في إنشاء المستخدم");

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: authData.user.id, role: data.role }]);

      if (roleError) throw roleError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("تم إضافة المستخدم بنجاح");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ في إنشاء المستخدم");
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: "admin" | "editor" }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: data.role })
        .eq('user_id', data.userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("تم تحديث دور المستخدم بنجاح");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ في تحديث الدور");
    }
  });

  // Delete user role mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Only delete the role, not the auth user
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("تم حذف صلاحيات المستخدم بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ في حذف المستخدم");
    }
  });

  // Update my data mutation
  const updateMyDataMutation = useMutation({
    mutationFn: async (data: { email?: string; password?: string }) => {
      const updates: { email?: string; password?: string } = {};
      
      if (data.email && data.email !== user?.email) {
        updates.email = data.email;
      }
      if (data.password) {
        updates.password = data.password;
      }
      
      if (Object.keys(updates).length === 0) {
        throw new Error("لم يتم إجراء أي تغييرات");
      }
      
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تحديث بياناتك بنجاح");
      setIsEditMyDataOpen(false);
      setMyDataForm({ email: "", password: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ في تحديث البيانات");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Only update role for existing user
        updateRoleMutation.mutate({ userId: editingUser.id, role: formData.role });
      } else {
        userSchema.parse(formData);
        createUserMutation.mutate(formData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleEdit = (userItem: UserWithRole) => {
    setEditingUser(userItem);
    setFormData({
      email: userItem.email,
      password: "",
      role: userItem.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (userId === user?.id) {
      toast.error("لا يمكنك حذف حسابك الخاص");
      return;
    }
    if (confirm("هل أنت متأكد من حذف صلاحيات هذا المستخدم؟")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", role: "editor" });
    setEditingUser(null);
  };

  const handleEditMyData = () => {
    setMyDataForm({
      email: user?.email || "",
      password: "",
    });
    setIsEditMyDataOpen(true);
  };

  const handleSaveMyData = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (myDataForm.password && myDataForm.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    
    updateMyDataMutation.mutate({
      email: myDataForm.email,
      password: myDataForm.password || undefined,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-lg">جاري التحقق...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">إدارة المستخدمين</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                المستخدمون
              </CardTitle>
              <CardDescription>إدارة المستخدمين وصلاحياتهم</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? "تعديل دور المستخدم" : "أدخل بيانات المستخدم الجديد"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editingUser && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          dir="ltr"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          dir="ltr"
                          className="text-right"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="role">الدور</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "admin" | "editor") => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-500" />
                            مدير (Admin)
                          </span>
                        </SelectItem>
                        <SelectItem value="editor">
                          <span className="flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-500" />
                            محرر (Editor)
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                      {editingUser ? "تحديث" : "إضافة"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا يوجد مستخدمين</div>
            ) : (
              <div className="space-y-4">
                {users.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${userItem.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {userItem.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-red-600" />
                        ) : (
                          <Pencil className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {userItem.id === user?.id ? "أنت" : `مستخدم ${userItem.id.substring(0, 8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {userItem.role === 'admin' ? 'مدير' : 'محرر'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        userItem.role === 'admin' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {userItem.role === 'admin' ? 'مدير' : 'محرر'}
                      </span>
                        {userItem.id === user?.id && userItem.role === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditMyData}
                            className="text-primary"
                          >
                            <Pencil className="w-4 h-4 ml-1" />
                            تعديل بياناتي
                          </Button>
                        )}
                        {userItem.id !== user?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(userItem)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(userItem.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit My Data Modal */}
        <Dialog open={isEditMyDataOpen} onOpenChange={setIsEditMyDataOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل بياناتي</DialogTitle>
              <DialogDescription>
                تحديث البريد الإلكتروني وكلمة المرور الخاصة بك
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveMyData} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="my-email">البريد الإلكتروني</Label>
                <Input
                  id="my-email"
                  type="email"
                  value={myDataForm.email}
                  onChange={(e) => setMyDataForm({ ...myDataForm, email: e.target.value })}
                  required
                  dir="ltr"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="my-password">كلمة المرور الجديدة (اتركها فارغة إذا لم ترد تغييرها)</Label>
                <Input
                  id="my-password"
                  type="password"
                  value={myDataForm.password}
                  onChange={(e) => setMyDataForm({ ...myDataForm, password: e.target.value })}
                  placeholder="••••••"
                  dir="ltr"
                  className="text-right"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={updateMyDataMutation.isPending}
                >
                  {updateMyDataMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditMyDataOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminUsers;
