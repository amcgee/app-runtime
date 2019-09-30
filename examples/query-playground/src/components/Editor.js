import React from 'react'

import AceEditor from 'react-ace'

import 'brace/mode/json'
import 'brace/theme/monokai'
import './Editor.css'

export const Editor = props => (
    <AceEditor
        fontSize={14}
        mode="json"
        theme="github"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height="100%"
        {...props}
    />
)
