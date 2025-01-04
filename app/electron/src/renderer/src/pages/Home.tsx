import { Layout } from '../../../../../../lib/frontend-common/src/components/Layout'
export const Home = () => {
  return (
    <Layout>
      <img
        style={{ width: '400px' }}
        className="d-block"
        alt="Welcome to your Dashboard"
        src="/images/cat.png"
      />
      Welcome to your dashboard.
    </Layout>
  )
}
