---
description: Always automatically commit changes to git after updating code
globs: *
---
# Git Commit & Push Rule

- Sau mỗi lần cập nhật code, sửa lỗi, thêm tính năng hoặc build thành công, hãy LUÔN LUÔN tự động:
  1. Chạy `git add .` và commit với thông điệp rõ ràng theo chuẩn conventional commit (vd: `fix(...)`, `feat(...)`).
  2. Tự động chạy `git push` để đẩy code lên GitHub ngay lập tức (để server/website kéo code mới nhất về).
- Không cần đợi người dùng phải nhắc commit hay push.
