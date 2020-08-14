import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonViewWillEnter,
  IonModal,
  IonButton,
  IonSearchbar,
} from '@ionic/react';
import React, { FC, useState, useRef } from 'react';
import axios from 'axios';
import { isNil, uniqBy, isEqual } from 'lodash';
import moment from 'moment';

import './Home.scss';

const BASE_URL: string = 'https://api.themoviedb.org/3/';
const API_KEY: string = process.env.REACT_APP_API_KEY ?? '';
const POSTER_URL: string = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER =
  'https://dummyimage.com/500x750/CCCCCC/ffffff.jpg&text=Poster+not+available';

interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  overview: string;
  vote_average: number;
}

const Home: FC = () => {
  const pageRef = useRef<HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [infiniteScroll, setInfiniteScroll] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const fetchPopularMovies = async (page = currentPage) => {
    try {
      const {
        data: { results, total_results },
      } = await axios.get(
        `${BASE_URL}movie/popular?api_key=${API_KEY}&page=${page}`
      );
      const uniqMovies = uniqBy([...popularMovies, ...results], 'id');

      console.log(uniqMovies);
      

      setPopularMovies(uniqMovies);
      setCurrentPage(page);
      setInfiniteScroll(isEqual(uniqMovies.length, total_results));
    } catch ({ message }) {
      setErrorMessage(message);
      setShowToast(true);
      setInfiniteScroll(true);
    }
  };

  useIonViewWillEnter(() => {
    fetchPopularMovies();
  });

  const nextPage = async ($event: CustomEvent<void>) => {
    await fetchPopularMovies(currentPage + 1);

    ($event.target as HTMLIonInfiniteScrollElement).complete();
  };

  const handlePoster = (poster: string) =>
    !isNil(poster) ? POSTER_URL + poster : FALLBACK_POSTER;

  return (
    <IonPage ref={pageRef}>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Popular Movies</IonTitle>
        </IonToolbar>

        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonChange={(event) => setSearchText(event.detail.value!)}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense" className="ion-no-border">
          <IonToolbar>
            <IonTitle size="large">Popular Movies</IonTitle>
          </IonToolbar>
        </IonHeader>

        {popularMovies.map(
          ({
            id,
            poster_path,
            title,
            release_date,
            overview,
            vote_average,
          }: Movie) => (
            <IonCard key={id} onClick={() => setShowModal(true)}>
              <IonImg src={handlePoster(poster_path)} />

              <IonCardHeader>
                <IonCardSubtitle>
                  {moment(release_date).format('MMM DD YYYY')}
                </IonCardSubtitle>

                <IonCardTitle>{title}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>{overview}</IonCardContent>
            </IonCard>
          )
        )}

        <IonInfiniteScroll
          threshold="10px"
          disabled={infiniteScroll}
          onIonInfinite={(event: CustomEvent<void>) => nextPage(event)}
        >
          <IonInfiniteScrollContent
            loadingSpinner="crescent"
            loadingText="Fetching more movies..."
          />
        </IonInfiniteScroll>

        <IonModal
          isOpen={showModal}
          swipeToClose={true}
          presentingElement={pageRef.current!}
          showBackdrop
          onDidDismiss={() => setShowModal(false)}
        >
          <p>This is modal content</p>
          <IonButton onClick={() => setShowModal(false)}>Close Modal</IonButton>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={errorMessage}
          duration={3000}
          translucent
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
