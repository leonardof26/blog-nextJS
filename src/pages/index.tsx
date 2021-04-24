import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { next_page: nextPage, results: posts } = postsPagination

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <main className={`${commonStyles.content}`}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href="/" key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <span>
                  <time>
                    <FiCalendar />
                    {post.first_publication_date}
                  </time>

                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </span>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [
        'publication.title',
        'publication.subtitle',
        'publication.author',
      ],
      pageSize: 100,
    }
  )

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      parseISO(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: pt,
      }
    ),

    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,

      author: post.data.author,
    },
  }))

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: { postsPagination },
  }
}
