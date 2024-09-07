import zod from "zod";

const userType = zod.object({
  username: zod.string().min(1, { message: "Please enter a valid username" }),
  email: zod.string().min(1, { message: "Please enter a valid email" }),
  fullName: zod.string().min(1, { message: "Please enter a valid fullName" }),
  avatar: zod.optional(),
  coverImage: zod.optional(),
  password: zod.string().min(1, { message: "Please enter a valid password" }),
});

export { userType };
