import type { NextPage } from 'next'
import Head from 'next/head'
import React, { ChangeEventHandler, useState } from 'react'
import styles from '../styles/Home.module.css'
import { Main } from './../components/Main'
import { signIn } from 'next-auth/client'
import Link from 'next/link'

const IndexPage: NextPage = () => {
	const [data, setData] = useState<{ email: string; password: string }>({
		email: '',
		password: '',
	})

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setData({
			...data,
			[event.target.name]: event.target.value,
		})
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		signIn('credentials', {
			email: data.email,
			password: data.password,
			callbackUrl: `${window.location.origin}/secret`,
		})
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>NeoG Camp Admission Portal</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Link href="/secret">Secret Page</Link>
			<div>
				login
				<input
					type="text"
					name="email"
					value={data.email}
					onChange={handleChange}
				/>
				<input
					type="text"
					name="password"
					value={data.password}
					onChange={handleChange}
				/>
				<button onClick={handleSubmit}>Login</button>
			</div>
		</div>
	)
}

export default IndexPage
