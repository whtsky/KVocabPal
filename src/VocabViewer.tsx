import PaPa from 'papaparse'
import React from 'react'
import { Button, Checkbox, Col, Row, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import { Vocab, VocabFields } from './model'
import type { CheckboxValueType } from 'antd/es/checkbox/Group'

function download(filename: string, text: string) {
  var element = document.createElement('a')
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

const defaultShowFields = ['stem', 'usage', 'title']

export default function VocabViewer({ vocabs }: { vocabs: Vocab[] }) {
  const [boldWord, setBoldWord] = React.useState(true)
  const [showFields, setShowFields] = React.useState(defaultShowFields)

  const onDownloadCsv = () => {
    download(
      'output.csv',
      PaPa.unparse(boldWord ? vocabs.map((vocab) => ({ ...vocab, usage: vocab.usageWithWordBolded })) : vocabs, {
        header: true,
        quotes: true,
        delimiter: ',',
        columns: showFields,
      }),
    )
  }

  const columns = [
    {
      title: 'stem',
      dataIndex: 'stem',
    },
    {
      title: 'word',
      dataIndex: 'word',
    },
    {
      title: 'usage',
      render: (vocab: Vocab) =>
        boldWord ? <span dangerouslySetInnerHTML={{ __html: vocab.usageWithWordBolded }} /> : vocab.usage,
    },
    {
      title: 'title',
      dataIndex: 'title',
    },
    {
      title: 'timestamp',
      dataIndex: 'timestamp',
      width: 5,
    },
  ].filter((column) => showFields.includes(column.title))

  const onToggleBoldWord = React.useCallback(() => {
    setBoldWord(!boldWord)
  }, [boldWord, setBoldWord])
  const onShowFieldsChange = React.useCallback(
    (newFields: CheckboxValueType[]) => {
      setShowFields(newFields as string[])
    },
    [setShowFields],
  )
  return (
    <Space direction="vertical">
      <Row justify="space-between" align="bottom">
        <Col flex="auto">
          <h3>Fields</h3>
          <Checkbox.Group options={VocabFields} value={showFields} onChange={onShowFieldsChange} />
          <h3>Options</h3>
          <Checkbox checked={boldWord} onChange={onToggleBoldWord}>
            Bold word in usage
          </Checkbox>
        </Col>
        <Col flex="none">
          <Button type="primary" icon={<DownloadOutlined />} style={{ float: 'right' }} onClick={onDownloadCsv}>
            Download CSV
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={vocabs} pagination={{ pageSize: 200 }} />
    </Space>
  )
}
