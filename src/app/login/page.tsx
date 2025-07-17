export const metadata = {
  title: 'Desert to Mountains | Login',
};

import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function Login() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
} 