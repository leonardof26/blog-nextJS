import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

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

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <main className={`${commonStyles.content}`}>
        <div className={styles.posts}>
          <Link href="/">
            <a>
              <strong>Como Utilizar Hooks</strong>
              <p>jnsadnjksadnjksan sjadnaskjd sjadsajd jasdnjksad</p>
              <span>
                <time>
                  <FiCalendar />
                  15 mar 2021
                </time>

                <span>
                  <FiUser />
                  Leonardo Fontes
                </span>
              </span>
            </a>
          </Link>
          <Link href="/">
            <a>
              <strong>Como Utilizar Hooks</strong>
              <p>jnsadnjksadnjksan sjadnaskjd sjadsajd jasdnjksad</p>
              <span>
                <time>
                  <FiCalendar />
                  15 mar 2021
                </time>

                <span>
                  <FiUser />
                  Leonardo Fontes
                </span>
              </span>
            </a>
          </Link>
        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
