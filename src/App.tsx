import React, { useState, useEffect, lazy, Suspense } from 'react'
import type { SqlJsStatic } from 'sql.js'

// eslint-disable-next-line import/no-webpack-loader-syntax
import sqlWasm from '!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm'
import { getVocabModelsFromQueryResult, Vocab } from './model'
import { Button, Col, Divider, Row, Skeleton, Steps } from 'antd'

import { DownloadOutlined, FileSearchOutlined, ImportOutlined, SmileOutlined, UsbOutlined } from '@ant-design/icons'

const { Step } = Steps

const query = `
select WORDS.stem, WORDS.word, LOOKUPS.usage, BOOK_INFO.title, LOOKUPS.timestamp
from LOOKUPS left join WORDS
on WORDS.id = LOOKUPS.word_key
left join BOOK_INFO
on BOOK_INFO.id = LOOKUPS.book_key
order by LOOKUPS.timestamp DESC`

const VocabViewer = lazy(() => import(/* webpackPrefetch: true */ /*webpackChunkName: 'viewer'*/ './VocabViewer'))

export default function App() {
  const [vocabs, setVocabs] = useState<Vocab[] | null>(null)
  const [SQL, setSQL] = useState<SqlJsStatic | null>(null)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const onError = (err: any) => setError(err)
    import(/* webpackPrefetch: true */ /*webpackChunkName: 'sql'*/ 'sql.js').then(({ default: initSqlJs }) => {
      initSqlJs({ locateFile: () => sqlWasm }).then((SQL) => setSQL(SQL), onError)
    }, onError)
  }, [setSQL])

  const uploadFileInputRef = React.createRef<HTMLInputElement>()
  const onUploadButtonClick = React.useCallback(() => uploadFileInputRef.current!.click(), [uploadFileInputRef])

  const onFileChange = React.useCallback(
    (e) => {
      const f = e.target.files[0]
      const r = new FileReader()
      r.onload = function () {
        if (r.result === null || typeof r.result == 'string' || SQL === null) {
          return
        }
        const Uints = new Uint8Array(r.result)
        const db = new SQL.Database(Uints)
        try {
          const results = db.exec(query)
          setVocabs(getVocabModelsFromQueryResult(results[0]))
          setError(null)
        } catch (e) {
          setError(e)
          setVocabs(null)
        }
      }
      r.readAsArrayBuffer(f)
    },
    [SQL, setVocabs, setError],
  )

  if (SQL == null) return <pre>loading</pre>

  const uploadStatus = vocabs === null ? 'process' : 'finish'
  const downloadAndProcessStatus = vocabs === null ? 'wait' : 'process'

  return (
    <div>
      <Row>
        <Col span={16} offset={4}>
          <Row style={{ marginTop: 10, marginBottom: 5 }} justify="space-between" align="middle">
            <a href="/" style={{ color: '#000', fontSize: '2em' }}>
              KVocabPal
            </a>
            <a href="https://github.com/whtsky/KVocabPal">GitHub</a>
          </Row>
          <p style={{ fontSize: '1.1em' }}>
            View & export your Kindle's vocabulary data, so you can process them in Excel or import them into{' '}
            <a href="https://apps.ankiweb.net/">Anki</a>.
          </p>
          <Divider orientation="left" plain>
            Instructions
          </Divider>
          <input ref={uploadFileInputRef} onChange={onFileChange} type="file" style={{ display: 'none' }} />

          <Steps direction="vertical">
            <Step status={uploadStatus} icon={<UsbOutlined />} title="Connect Kindle to your computer" />
            <Step
              status={uploadStatus}
              icon={<FileSearchOutlined />}
              title="Find vocab.db file from your Kindle"
              description=""
            />
            <Step
              icon={<ImportOutlined />}
              title={
                <Button onClick={onUploadButtonClick} loading={SQL === null}>
                  Choose your vocab.db
                </Button>
              }
              status={uploadStatus}
            />
            <Step
              icon={<DownloadOutlined />}
              title="Download CSV using the button below"
              status={downloadAndProcessStatus}
            />
            <Step
              icon={<SmileOutlined />}
              title="Open CSV using Excel, or import it in Anki"
              description={
                <div>
                  You can use Anki plugins like <a href="https://ankiweb.net/shared/info/1807206748">FastWordQuery</a>{' '}
                  to add word definitions.
                </div>
              }
              status={downloadAndProcessStatus}
            />
          </Steps>

          {error && <pre>{error.toString()}</pre>}
          {vocabs && (
            <>
              <Divider orientation="left" plain>
                Your Kindle Vocabulary
              </Divider>
              <Suspense fallback={<Skeleton />}>
                <VocabViewer vocabs={vocabs} />
              </Suspense>
            </>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.9em' }}>
            <a href="https://github.com/whtsky/KVocabPal">KVocabPal</a> is created by{' '}
            <a href="https://github.com/whtsky/">whtsky</a>
          </p>
        </Col>
      </Row>
    </div>
  )
}
