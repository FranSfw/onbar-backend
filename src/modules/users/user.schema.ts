// src/modules/users/user.schema.ts
import S from 'fluent-json-schema';

export const createUserSchema = S.object()
  .id('createUserSchema')
  .title('Create User Schema')
  .prop('uid', S.string().required())
  .prop('username', S.string().required().minLength(3).maxLength(30))
  .prop('name', S.string().required().minLength(2))
  .prop('email', S.string().format('email').required())
  .prop('role', S.string().enum(['barista', 'manager']).required())
  .prop('bio', S.string().maxLength(200))
  .prop('profilePhotoURL', S.string().format('url'))
  .prop('coverPhotoURL', S.string().format('url'));

export const updateUserSchema = S.object()
  .id('updateUserSchema')
  .title('Update User Schema')
  .prop('name', S.string().minLength(2))
  .prop('bio', S.string().maxLength(200))
  .prop('profilePhotoURL', S.string().format('url'))
  .prop('coverPhotoURL', S.string().format('url'))
  .prop('skills', S.array().items(S.string()));