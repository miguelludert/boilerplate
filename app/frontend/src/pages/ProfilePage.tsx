import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { AppUserData, useCurrentUser } from '../providers/AuthProvider';
import { useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { UserAvatar } from '../components/UserAvatar';
import { Form } from '../components/Form';
import { Input } from '../components';

export interface ProfileViewProps {
  setCurrentView: (view: ProfileViews) => void;
}

export type ProfileViews = 'default' | 'edit' | 'passwordProtected';

export const ProfilePage = () => {
  const [currentView, setCurrentView] = useState<ProfileViews>('default');
  const CurrentView = {
    default: ProfileDisplay,
    edit: ProfileEdit,
    passwordProtected: ProfileEmailPassword,
  }[currentView];
  return (
    <Layout>
      <CurrentView setCurrentView={setCurrentView} />
    </Layout>
  );
};

export function ProfileDisplay({ setCurrentView }: ProfileViewProps) {
  const { userData: userData, uploadAvatar } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar({ file });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className='d-flex justify-items-center flex-space-around'>
        <UserAvatar height={'200px'} width={'200px'} />
        <div className='d-flex flex-column justify-items-center'>
          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the input field
          />
          <Button className='m-2' onClick={handleButtonClick}>
            Change Avatar
          </Button>
          <Button
            className='m-2'
            onClick={() => setCurrentView('passwordProtected')}
          >
            Change Email & Password
          </Button>
          <Button className='m-2' onClick={() => setCurrentView('edit')}>
            Edit Profile
          </Button>
        </div>
      </div>
      <div>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            First name:
          </Col>
          <Col xs={12} md={6}>
            {userData?.firstName}
          </Col>
        </Row>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            Last name:
          </Col>
          <Col xs={12} md={6}>
            {userData?.lastName}
          </Col>
        </Row>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            Email Address:
          </Col>
          <Col xs={12} md={6}>
            {userData?.email}
          </Col>
        </Row>
      </div>
    </>
  );
}

export function ProfileEdit({ setCurrentView }: ProfileViewProps) {
  const { userData, saveUserData } = useCurrentUser();
  const onSubmit = async (data: AppUserData) => {
    console.info('is this correct', data);
    await saveUserData(data);
    setCurrentView('default');
  };

  return (
    <Form onSubmit={onSubmit} defaultValues={userData}>
      <h1>Edit Profile</h1>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          First name:
        </Col>
        <Col xs={12} md={6}>
          <Input name='firstName' type='text' placeholder='Your First Name' />
        </Col>
      </Row>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          Last name:
        </Col>
        <Col xs={12} md={6}>
          <Input name='lastName' type='text' placeholder='Your Last Name' />
        </Col>
      </Row>
      <Row xs={12} md={6}>
        <Button type='submit'>Save Profile</Button>
        <Button
          type='button'
          onClick={() => setCurrentView('default')}
          color='danger'
        >
          Cancel
        </Button>
      </Row>
    </Form>
  );
}

export function ProfileEmailPassword({ setCurrentView }: ProfileViewProps) {
  const { saveEmailAndPassword } = useCurrentUser();
  const onSubmit = async (data: {
    oldPassword: string;
    email?: string;
    newPassword?: string;
  }) => {
    console.info('is this correct', data);
    await saveEmailAndPassword(data);
    setCurrentView('default');
  };

  return (
    <Form onSubmit={onSubmit}>
      <h1>Edit Email Address and Password</h1>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          Current Password:
        </Col>
        <Col xs={12} md={6}>
          <Input
            name='oldPassword'
            type='text'
            placeholder='Current Password'
          />
        </Col>
      </Row>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          New Email Address:
        </Col>
        <Col xs={12} md={6}>
          <Input
            name='newEmailAddress'
            type='text'
            placeholder='New Email Address'
          />
        </Col>
      </Row>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          New Password:
        </Col>
        <Col xs={12} md={6}>
          <Input name='newPassword' type='text' placeholder='New Password' />
        </Col>
      </Row>
      <Row xs={12} md={6}>
        <Button type='submit'>Save Email and Password</Button>
        <Button
          type='button'
          onClick={() => setCurrentView('default')}
          color='danger'
        >
          Cancel
        </Button>
      </Row>
    </Form>
  );
}
