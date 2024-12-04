import { Link } from 'react-router-dom';
import { styled } from '@stitches/react';
import { Col, Row } from 'reactstrap';
import { useLogout, useUser } from '../providers/AuthProvider';
import { Button } from '../components/Button';
import { routes } from '../routes';
import { UserAvatar } from './UserAvatar';

const LayoutContainer = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

const Header = styled(Row, {
  backgroundColor: '#03051E',
  borderBottom: '1px silver solid',
});

const MainContainer = styled('div', {
  height: '100%',
});

const LeftNav = styled('div', {
  width: '150px',
  borderRight: '1px silver solid',
});

const Content = styled('div', {
  overflow: 'auto',
});

const Logo = styled('div', {
  fontFamily: 'impact',
  fontSize: '20px',
  fontWeight: 'bold',
  textDecoration: 'none',
  color: 'white',
});

export const Layout = ({ children }: { children: any }) => {
  const { logout, displayName } = useUser();
  return (
    <LayoutContainer>
      <Header className='d-flex justify-content-between p-1'>
        <Col>
          <Link to='/'>
            <Logo>Your Logo Here</Logo>
          </Link>
        </Col>
        <Col className='d-flex justify-content-end'>
          <Link to='/profile'>
            Welcome {displayName}
            <UserAvatar height='24px' width='24px' />
          </Link>
          <Button color='secondary' onClick={logout}>
            <img alt='logout' src='/icons/logout.svg' />
          </Button>
        </Col>
      </Header>
      <MainContainer className='d-flex justify-content-between'>
        <LeftNav className='p-2'>
          {routes.map((route) => {
            return (
              <Link className='d-block' to={route.path!} key={route.path}>
                {route.label ?? route.path}
              </Link>
            );
          })}
        </LeftNav>
        <Content className='p-2 w-100 flex-fill'>{children}</Content>
      </MainContainer>
    </LayoutContainer>
  );
};
