import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import Prismic from '@prismicio/client'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser } from 'react-icons/fi'

import { useState } from 'react'
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse'
import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'
import Header from '../components/Header'

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

function convertPrismPosts(data: ApiSearchResponse): Post[] {
  const posts = data.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,

    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,

      author: post.data.author,
    },
  }))

  return posts
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { next_page, results } = postsPagination

  const [nextPage, setNextPage] = useState(next_page)
  const [posts, setPosts] = useState(results)

  async function handleGetMorePosts(): Promise<void> {
    const resp: ApiSearchResponse = await fetch(nextPage).then(response =>
      response.json()
    )

    const newPostList = [...posts, ...convertPrismPosts(resp)]

    setNextPage(resp.next_page)
    setPosts(newPostList)
  }

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <Header />

      <main className={`${commonStyles.content}`}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <span>
                  <time>
                    <FiCalendar />
                    {format(
                      parseISO(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: pt,
                      }
                    )}
                  </time>

                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </span>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              type="button"
              className={styles.pagination}
              onClick={handleGetMorePosts}
            >
              Carregar mais posts
            </button>
          )}
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
      pageSize: 1,
    }
  )

  const posts = convertPrismPosts(postsResponse)

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: { postsPagination },
    revalidate: 60 * 30, // 30 minutos
  }
}
