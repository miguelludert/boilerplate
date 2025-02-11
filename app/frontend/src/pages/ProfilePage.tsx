import { useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import {
  Input,
  Form,
  UserAvatar,
  Button,
  Layout,
  AppUserData,
  useCurrentUser,
} from "@miguelludert/frontend-common";

export interface ProfileViewProps {
  setCurrentView: (view: ProfileViews) => void;
}

export type ProfileViews = "default" | "edit";

export const ProfilePage = () => {
  const [currentView, setCurrentView] = useState<ProfileViews>("default");
  const CurrentView = {
    default: ProfileDisplay,
    edit: ProfileEdit,
  }[currentView];
  return (
    <Layout>
      <CurrentView setCurrentView={setCurrentView} />
    </Layout>
  );
};

export function ProfileDisplay({ setCurrentView }: ProfileViewProps) {
  const { appUserData, uploadAvatar } = useCurrentUser();
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
      console.error("Upload failed:", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="d-flex justify-items-center flex-space-around">
        <UserAvatar height={"200px"} width={"200px"} />
        <div className="d-flex flex-column justify-items-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }} // Hide the input field
          />
          <Button className="m-2" onClick={handleButtonClick}>
            Change Avatar
          </Button>
          <Button className="m-2" onClick={() => setCurrentView("edit")}>
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
            {appUserData?.firstName}
          </Col>
        </Row>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            Last name:
          </Col>
          <Col xs={12} md={6}>
            {appUserData?.lastName}
          </Col>
        </Row>
        <Row xs={12} lg={6}>
          <Col xs={12} md={6}>
            Email Address:
          </Col>
          <Col xs={12} md={6}>
            {appUserData?.email}
          </Col>
        </Row>
      </div>
    </>
  );
}

export function ProfileEdit({ setCurrentView }: ProfileViewProps) {
  const { appUserData, saveUserData } = useCurrentUser();
  const onSubmit = async (data: AppUserData) => {
    await saveUserData(data);
    setCurrentView("default");
  };

  return (
    <Form onSubmit={onSubmit} defaultValues={appUserData}>
      <h1>Edit Profile</h1>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          Email Address:
        </Col>
        <Col xs={12} md={6}>
          <Input name="email" type="text" placeholder="Email Address" />
        </Col>
      </Row>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          First name:
        </Col>
        <Col xs={12} md={6}>
          <Input name="firstName" type="text" placeholder="Your First Name" />
        </Col>
      </Row>
      <Row xs={12} lg={6}>
        <Col xs={12} md={6}>
          Last name:
        </Col>
        <Col xs={12} md={6}>
          <Input name="lastName" type="text" placeholder="Your Last Name" />
        </Col>
      </Row>
      <Row xs={12} md={6}>
        <Button type="submit">Save Profile</Button>
        <Button
          type="button"
          onClick={() => setCurrentView("default")}
          color="danger"
        >
          Cancel
        </Button>
      </Row>
    </Form>
  );
}
