import Joi from "joi";

const registerValidation = (data) => {
  const Schema = Joi.object({
    username: Joi.string().max(25).required().alphanum(),
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .pattern(new RegExp("^[a-zA-Z0-9]{8,25}$"))
      .messages({
        "string.pattern.base": `Password should be between 8 to 25 characters and contain letters or numbers only`,
        "string.empty": `Password cannot be empty`,
        "any.required": `Password is required`,
      }),
    birthday: Joi.date().max("12-31-2011").min("1-1-1900").required(),
    gender: Joi.string().required().valid("male", "female"),
    info: Joi.string(),
  });
  return Schema.validate(data);
};
const forgetPasswordValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .pattern(new RegExp("^[a-zA-Z0-9]{8,25}$"))
      .messages({
        "string.pattern.base": `Password should be between 8 to 25 characters and contain letters or numbers only`,
        "string.empty": `Password cannot be empty`,
        "any.required": `Password is required`,
      }),
  });
  return Schema.validate(data);
};
const patchValidation = (data) => {
  const Schema = Joi.object({
    username: Joi.string().max(25).required().alphanum(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    patchPassword: Joi.string()
      .allow(null, "")
      .pattern(new RegExp("^[a-zA-Z0-9]{8,25}$")),
    birthday: Joi.date().max("12-31-2011").min("1-1-1900").required(),
    gender: Joi.string().required().valid("male", "female"),
    info: Joi.string(),
    thumbnail: Joi.string().allow(null, ""),
    coverPhoto: Joi.string().allow(null, ""),
  });
  return Schema.validate(data);
};
const roomValidation = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    users: Joi.array().min(1),
    image: Joi.string(),
  });
  return Schema.validate(data);
};

const postValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    communityId: Joi.string().required(),
    image: Joi.string(),
  });
  return Schema.validate(data);
};

const communityValidation = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    rules: Joi.array(),
    icon: Joi.string(),
    banner: Joi.string(),
    managers: Joi.array(),
  });

  return Schema.validate(data);
};

const commentValidation = (data) => {
  const Schema = Joi.object({
    content: Joi.string().required(),
    parentComment: Joi.string(),
    image: Joi.string(),
  });
  return Schema.validate(data);
};
export {
  registerValidation,
  roomValidation,
  postValidation,
  communityValidation,
  commentValidation,
  patchValidation,
  forgetPasswordValidation,
};
