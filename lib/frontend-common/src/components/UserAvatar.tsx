import { styled } from '@stitches/react';
// import { ImageWithFallback } from './ImageWithFallback';
// import { getApiEndoint } from '../constants';
import { useCurrentUser } from '../providers/AuthProvider';

export interface UserAvatarProps {
  height: string;
  width: string;
}

export const UserAvatar = ({ height, width, ...props }: UserAvatarProps) => {
  const Avatar = styled('img', {
    height,
    width,
  });
  const { avatar } = useCurrentUser();
  return <Avatar src={avatar} {...props} />;
};
