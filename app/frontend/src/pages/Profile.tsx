import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useUser } from '../providers/AuthProvider';
import { useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import axios from 'axios';
import { getApiEndoint } from '../constants';
import { UserAvatar } from '../components/UserAvatar';

export const Profile = () => {
  const { displayName, email, reloadAvatar } = useUser();
  const [isEditable, setIsEditable] = useState(false);
  const onEdit = () => setIsEditable(true);
  const onSave = () => setIsEditable(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      const response = await axios.post(getApiEndoint('/user/avatar'), {
        fileName: file.name,
        fileType: file.type,
      });
      const uploadUrl = response.data.uploadUrl;
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
      reloadAvatar();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Layout>
      <div className='d-flex justify-items-center flex-space-around'>
        <UserAvatar height={'200px'} width={'200px'} />
        <div
          className='d-flex flex-column justify-items-center'
          hidden={isEditable}
        >
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
          <Button className='m-2'>Change Password</Button>
          <Button className='m-2' onClick={onEdit}>
            Edit Profile
          </Button>
        </div>
      </div>
      <div>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            Your name:
          </Col>
          <Col xs={12} md={6}>
            {displayName}
          </Col>
        </Row>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            Your email:
          </Col>
          <Col xs={12} md={6}>
            {email}
          </Col>
        </Row>
        <div hidden={!isEditable}>
          <Button onClick={onSave}>Save Profile</Button>
          <Button onClick={onSave} color='danger'>
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};
