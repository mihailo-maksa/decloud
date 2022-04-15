import React, { useState, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import { Web3Storage } from 'web3.storage'
import {
  MESSAGE,
  formatCid,
  formatDate,
  formatFileSize,
  copyToClipboard,
} from './utils'
import './App.css'

interface AppProps {}

interface TableRowProps {
  fileInfo: File
}

const App: React.FC<AppProps> = (): JSX.Element => {
  const [address, setAddress] = useState<string>('')
  const [files, setFiles] = useState<FileList | any>([])
  const [fileInfoArray, setFileInfoArray] = useState<File[]>([])
  const [, setIsLoggedIn] = useState<boolean>(false)
  const [totalSize, setTotalSize] = useState<number>(0)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  const client: Web3Storage = useMemo(
    () =>
      new Web3Storage({
        token: process.env.REACT_APP_WEB3_STORAGE_TOKEN as string,
      }),
    [],
  )

  const signUp = async () => {
    try {
      const currentProvider = new ethers.providers.Web3Provider(window.ethereum)
      await currentProvider.send('eth_requestAccounts', [])

      const currentSigner = await currentProvider.getSigner()
      const currentAddress = await currentSigner.getAddress()
      setAddress(currentAddress)

      const signature = await currentSigner.signMessage(MESSAGE)
      await localStorage.setItem('signature', signature)
      setIsLoggedIn(true)
    } catch (error) {
      console.error(error)
    }
  }

  // const login = async () => {
  //   try {
  //     const currentProvider = new ethers.providers.Web3Provider(window.ethereum)
  //     await currentProvider.send('eth_requestAccounts', [])

  //     const currentSigner = await currentProvider.getSigner()
  //     const currentAddress = await currentSigner.getAddress()
  //     setAddress(currentAddress)

  //     const signerAddress = await ethers.utils.verifyMessage(
  //       MESSAGE,
  //       localStorage.getItem('signature')!,
  //     )
  //     if (signerAddress !== currentAddress) {
  //       alert('Signature is not valid. Please try again!')
  //     }
  //     setIsLoggedIn(currentAddress === signerAddress)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentFiles = event.target.files
    const currentFilesArr = Array.prototype.slice.call(currentFiles)
    setFiles([...files, ...currentFilesArr])
  }

  const switchTheme = () => {
    if (JSON.parse(localStorage.getItem('Mode') as any) === false) {
      setIsDarkMode(true)
      localStorage.setItem('Mode', JSON.stringify(true))
    } else {
      setIsDarkMode(false)
      localStorage.setItem('Mode', JSON.stringify(false))
    }
  }

  const uploadFile = async () => {
    try {
      const fileInput = document.querySelector(
        "input[type='file']",
      ) as HTMLInputElement

      const currentRootCid = await client.put(fileInput.files as FileList)

      if (!localStorage.getItem('rootCidArray')) {
        localStorage.setItem('rootCidArray', JSON.stringify([]))
      }

      const rootCidArray = JSON.parse(localStorage.getItem('rootCidArray')!)

      rootCidArray.push(currentRootCid)
      localStorage.setItem('rootCidArray', JSON.stringify(rootCidArray))

      alert('File uploaded successfully!')
      window.location.reload()
    } catch (error) {
      alert('Something went wrong. Please try again!')
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchFiles = async () => {
      if (localStorage.getItem('rootCidArray')) {
        const rootCidArray = JSON.parse(localStorage.getItem('rootCidArray')!)
        const filteredRootCidArray = rootCidArray.filter(
          (rootCid: string, index: number) =>
            rootCidArray.indexOf(rootCid) === index,
        )

        const currentFilesArray: File[] = []

        await Promise.all(
          filteredRootCidArray.map(async (rootCid: string) => {
            const res = await client.get(rootCid)
            const currentFiles = await res!.files()
            currentFilesArray.push(...currentFiles)
          }),
        )

        setFileInfoArray(currentFilesArray)

        const currentTotalSize = currentFilesArray.reduce(
          (acc: number, file: File) => acc + file.size,
          0,
        )

        setTotalSize(currentTotalSize)
      }
    }

    fetchFiles()
    // eslint-disable-next-line
  }, [client])

  const TableRow: React.FC<TableRowProps> = ({ fileInfo }): JSX.Element => {
    return (
      <tr>
        <td>
          {
            //@ts-ignore
            formatDate(fileInfo.lastModifiedDate)
          }
        </td>
        <td>{fileInfo.name}</td>
        <td>
          <a
            href={
              //@ts-ignore
              `https://${fileInfo.cid}.ipfs.nftstorage.link`
            }
            rel="noopener noreferrer"
            target="_blank"
            className=""
          >
            {
              //@ts-ignore
              formatCid(fileInfo.cid)
            }
          </a>{' '}
          <i
            className="far fa-clipboard clipboard"
            title="Copy to CID to Clipboard"
            onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) =>
              //@ts-ignore
              copyToClipboard(e, fileInfo.cid)
            }
          />
        </td>
        <td>
          {
            //@ts-ignore
            fileInfo.pinStatus
          }
        </td>
        <td>{formatFileSize(fileInfo.size)}</td>
      </tr>
    )
  }

  return (
    <div className={isDarkMode ? 'App-dark' : 'App'}>
      <h1 className="main-title bold mb-4">DeCloud</h1>

      <div className="theme-picker mb-4">
        {isDarkMode ? (
          <i className="fas fa-sun theme-picker-icon" onClick={switchTheme} />
        ) : (
          <i className="fas fa-moon theme-picker-icon" onClick={switchTheme} />
        )}
      </div>

      {localStorage.getItem('signature') !== '' ? (
        <div className="app-container">
          <div className="personal-stats mb-5">
            {address && (
              <p className="stat-item">
                <strong>Your Address: </strong>
                {address}
              </p>
            )}
            <p className="stat-item">
              <strong>Number of Files Stored: </strong>
              {fileInfoArray.length} files
            </p>
            <p className="stat-item">
              <strong>Total Size: </strong>
              {formatFileSize(totalSize)}
            </p>
          </div>

          <div className="upload-form mb-5">
            <h2 className="subtitle mb-4 bold">Upload Files</h2>

            <div className="form-group mb-3">
              <input
                type="file"
                name="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e)
                }
                required
                multiple={true}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <button
                className="btn btn-primary bold"
                type="button"
                onClick={uploadFile}
              >
                <i className="fas fa-cloud-upload" /> Upload Files
              </button>
            </div>
          </div>

          <div className="my-files">
            <h2 className="subtitle bold mb-4">My Files</h2>

            <div className="file-list">
              <table
                className={`table table-bordered ${
                  isDarkMode ? 'table-dark' : ''
                }`}
              >
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Name</th>
                    <th scope="col">CID</th>
                    <th scope="col">Pin Status</th>
                    <th scope="col">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {fileInfoArray.map((fileInfo: File) => (
                    //@ts-ignore
                    <TableRow key={fileInfo.cid} fileInfo={fileInfo} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="signup">
          <button
            type="button"
            className="btn btn-primary bold"
            onClick={signUp}
          >
            Sign Up with MetaMask
          </button>
        </div>
      )}
    </div>
  )
}

export default App
