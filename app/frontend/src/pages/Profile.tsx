import { styled } from '@stitches/react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useUser } from '../providers/AuthProvider';

const Avatar = styled('img', {
  width: '200px',
  height: '200px',
});

export const Profile = () => {
  const { avatar, displayName, email } = useUser();
  return (
    <Layout>
      <div className='d-flex justify-items-center flex-space-around'>
        <Avatar alt='avatar' src={avatar} />
        <div className='d-flex flex-column justify-items-center'>
          <Button className='m-2'>Change Avatar</Button>
          <Button className='m-2'>Change Password</Button>
        </div>
      </div>
      <div>{displayName}</div>
      <hr></hr>
      <div>{email}</div>
    </Layout>
  );
};
