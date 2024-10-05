import Joi from "joi";

const registerValidation = (data) => {
  const Schema = Joi.object({
    username: Joi.string().max(25).required().alphanum(),
    email: Joi.string().required().email(),
    password: Joi.string().pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9]@$!%*?&]{8,}$"
      )
    ),
    birthday: Joi.date().max("12-31-2011").min("1-1-1900").required(),
    gebder: Joi.string().required().valid("male", "female"),
  });
  return Schema.validate(data);
};
const roomValidation = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    users: Joi.array().min(1),
  });
  return Schema.validate(data);
};

const postValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    communityId: Joi.string(),
  });
  return Schema.validate(data);
};

const communityValidation = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    rules: Joi.array(),
  });

  return Schema.validate(data);
};
export {
  registerValidation,
  roomValidation,
  postValidation,
  communityValidation,
};
