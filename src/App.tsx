import React, { useState, useEffect } from 'react'
import initSqlJs, { SqlJsStatic } from 'sql.js'

// eslint-disable-next-line import/no-webpack-loader-syntax
import sqlWasm from '!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm'
import { VocabViewer } from './VocabViewer'
import { getVocabModelsFromQueryResult, Vocab } from './model'
import { Button, Col, Divider, Row } from 'antd'

import { UploadOutlined } from '@ant-design/icons'
const query = `
select WORDS.stem, WORDS.word, LOOKUPS.usage, BOOK_INFO.title, LOOKUPS.timestamp
from LOOKUPS left join WORDS
on WORDS.id = LOOKUPS.word_key
left join BOOK_INFO
on BOOK_INFO.id = LOOKUPS.book_key
order by LOOKUPS.timestamp DESC`

export default function App() {
  const [vocabs, setVocabs] = useState<Vocab[] | null>(null)
  const [SQL, setSQL] = useState<SqlJsStatic | null>(null)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    initSqlJs({ locateFile: () => sqlWasm }).then(
      (SQL) => setSQL(SQL),
      (err) => setError(err),
    )
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

  return (
    <div>
      <Row>
        <Col span={16} offset={4}>
          <Row style={{ marginTop: 10 }} justify="space-between" align="middle">
            <a href="/" style={{ color: '#000', fontSize: '2em' }}>
              KVocabPal
            </a>
            <a href="https://github.com/whtsky/KVocabPal">GitHub</a>
          </Row>
          <Divider orientation="left" plain>
            Choose Kindle Vocab file
          </Divider>
          <input ref={uploadFileInputRef} onChange={onFileChange} type="file" style={{ display: 'none' }} />
          <Button onClick={onUploadButtonClick} icon={<UploadOutlined />}>
            Choose your vocab.db
          </Button>
          {error && <pre>{error.toString()}</pre>}
          {vocabs && (
            <>
              <Divider orientation="left" plain>
                Your Kindle Vocabulary
              </Divider>
              <VocabViewer vocabs={vocabs} />
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}
