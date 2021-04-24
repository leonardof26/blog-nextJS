/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import Prismic from '@prismicio/client'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { Fragment, useMemo } from 'react'
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'
import Header from '../../components/Header'

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
  const readingMinutes = useMemo((): number => {
    if (!post) return 0

    const totalWords = post.data.content.reduce((acc, postTxt) => {
      const totalWordsHeader = postTxt.heading.split(/\s/g).length

      const bodyText = RichText.asText(postTxt.body)

      const totalWordsBody = bodyText.split(/\s/g).length

      return totalWordsHeader + totalWordsBody + acc
    }, 0)

    return Math.ceil(totalWords / 200)
  }, [post])

  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | ignews</title>
      </Head>

      <Header />

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
                {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                  locale: pt,
                })}
              </span>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {readingMinutes} min
              </span>
            </div>

            <div className={styles.postContent}>
              {post.data.content.map(content => (
                <Fragment key={content.heading}>
                  <h4>{content.heading}</h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </Fragment>
              ))}
            </div>
          </article>
        </main>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [''],
      pageSize: 5,
    }
  )

  const posts = postsResponse.results.map(post => ({ slug: post.uid }))

  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient()
  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content?.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
  }

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutos
  }
}
