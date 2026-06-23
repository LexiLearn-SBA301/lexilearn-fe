// Quyết định trang đích sau khi đăng nhập dựa trên role của user.
// Hiện tại mọi role đều về trang chính '/'. Khi có trang admin riêng,
// chỉ cần sửa nhánh tương ứng tại đây — không phải đụng vào useLogin.
export const resolveHomeRoute = (roles = []) => {
  if (roles.includes('ADMIN')) return '/' // TODO: đổi sang '/admin/...' khi có trang admin
  if (roles.includes('USER')) return '/'
  return '/' // fallback cho role chưa được định nghĩa
}
