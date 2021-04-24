import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Post {
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: {
      heading: string
      body: {
        text: string
      }[]
    }[]
  }
}

interface PostProps {
  post: Post
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post)
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | ignews</title>
      </Head>

      <main className={`${styles.container}`}>
        <div className={styles.imageDiv}>
          <img src={post.data.banner.url} alt="banner" />
        </div>

        <main className={`${commonStyles.content}`}>
          <article className={styles.post}>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfo}>
              <span>
                <FiCalendar />
                {post.first_publication_date}
              </span>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                aiaiaiaiaiaaiaiaiaiaiaiaiaaiiaaiaiaiaiaa
              </span>
            </div>

            <div className={styles.postContent}>
              {post.data.content.map(content => (
                <>
                  <h4>{content.heading}</h4>
                  {content.body.map(body => (
                    <p>{body.text}</p>
                  ))}
                </>
              ))}
            </div>
          </article>
        </main>
      </main>
    </>
  )
}

// export const getStaticPaths: GetStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   return

//   // TODO
// };

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: true }
}

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient()
  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    first_publication_date: format(
      parseISO(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: pt,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content?.map(content => ({
        heading: content.heading,
        body: content.body.map(body => ({ text: body.text })),
      })),
    },
  }

  return {
    props: { post },
  }
}
