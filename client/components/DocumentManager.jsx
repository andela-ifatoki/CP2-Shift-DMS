import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { Checkbox, Form } from 'semantic-ui-react';
import { saveNewDocument, cancelNewDocument } from '../actions/documents';

const editModes = {
  READ: 'READ',
  WRITE: 'WRITE',
  NEW: 'NEW'
};

class DocumentManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
      accessId: 1,
      rightId: 3, // Read access
      accessMode: this.props.createNew ?
       editModes.NEW : editModes.READ
    };
    this.onChange = this.onChange.bind(this);
    this.saveDocument = this.saveDocument.bind(this);
    this.editDocument = this.editDocument.bind(this);
    this.handleRadioButtonChange = this.handleRadioButtonChange.bind(this);
    this.cancelNewDocument = this.cancelNewDocument.bind(this);
  }

  componentDidMount() {
    tinymce.init({
      selector: '.tinymcepanel',
      init_instance_callback: (editor) => {
        editor.on('keyup', () => {
          this.setState({
            content: editor.getContent()
          });
        });
        editor.on('undo', () => {
          this.setState({
            content: editor.getContent()
          });
        });
        editor.on('redo', () => {
          this.setState({
            content: editor.getContent()
          });
        });
        editor.on('Change', () => {
          this.setState({
            content: editor.getContent()
          });
        });
        editor.on('dirty', () => {
          console.log('Just got dirty. You may now enable save button');
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentDocument || nextProps.createNew) {
      this.setState({
        rightId: nextProps.rightId,
        accessMode: nextProps.createNew ?
          editModes.NEW : editModes.READ,
      }, () => {
        const isNew = nextProps.currentDocument === null;
        this.setState({
          title: isNew ? '' : nextProps.currentDocument.title,
          content: isNew ? '' : nextProps.currentDocument.content,
          accessId: isNew ? '' : nextProps.currentDocument.accessId
        }, () => {
          $('#contentHolder').children().remove();
          $(this.state.content).prependTo('#contentHolder');
          tinymce.activeEditor.setContent(this.state.content);
        });
      });
    }
  }

  onChange(event) {
    event.preventDefault();
    this.setState(event.target.name !== 'title' ?
      { content: event.target.getContent() } :
      { [event.target.name]: event.target.value }
    );
  }

  handleRadioButtonChange(event, { value }) {
    this.setState({ accessId: parseInt(value, 10) });
  }

  saveDocument(event) {
    event.preventDefault();
    this.props.saveNewDocument({
      title: this.state.title,
      content: this.state.content,
      ownerId: this.props.user.id,
      accessId: this.state.accessId
    });
  }

  editDocument(event) {
    event.preventDefault();
    if (this.props.rightId < 3) {
      this.setState({
        accessMode: editModes.WRITE
      }, () => {
        tinymce.activeEditor.setContent(this.state.content);
      });
    }
  }

  cancelNewDocument(event) {
    event.preventDefault();
    this.props.cancelNewDocument();
  }

  render() {
    const { accessId } = this.state;
    return (
      <div className="ui longer fullscreen modal">
        <div className="header">
          <div className="ui container">
            {this.props.createNew ?
            'Create your document here' :
            this.state.title}
            <textarea
              style={{
                display: this.state.accessMode === editModes.WRITE ?
                  'block' : 'none'
              }}
              rows="1"
              placeholder="Title"
              name="title"
              onChange={this.onChange}
              value={this.state.title}
            />
          </div>
        </div>
        <div
          className="ui container"
        >
          <div
            className="ui form"
            style={{
              display: (
                this.state.accessMode === editModes.WRITE ||
                this.state.accessMode === editModes.NEW
              ) ? 'block' : 'none'
            }}
          >
            <div className="field">
              <textarea
                rows="1"
                placeholder="Title"
                name="title"
                onChange={this.onChange}
                value={this.state.title}
              />
            </div>
            <div className="two fields">
              <Form.Field width={3}>
                <Form.Field>
                  <Checkbox
                    radio
                    label="Private"
                    name="accessRadioGroup"
                    checked={accessId === 1}
                    value="1"
                    onChange={this.handleRadioButtonChange}
                  />
                </Form.Field>
                <Form.Field>
                  <Checkbox
                    radio
                    label="Public"
                    name="accessRadioGroup"
                    checked={accessId === 2}
                    value="2"
                    onChange={this.handleRadioButtonChange}
                  />
                </Form.Field>
                <Form.Field>
                  <Checkbox
                    radio
                    label="Shared"
                    name="accessRadioGroup"
                    checked={accessId === 3}
                    value="3"
                    onChange={this.handleRadioButtonChange}
                  />
                </Form.Field>
              </Form.Field>
              <Form.Field disabled={accessId !== 3} width={13}>
                <h1>Itunuloluwa</h1>
              </Form.Field>
            </div>
            <div className="field">
              <textarea
                className="tinymcepanel"
              />
            </div>
          </div>
          <div
            id="contentHolder"
            style={{
              display: this.state.accessMode === editModes.READ ?
                'block' : 'none',
              height: '500px'
            }}
          />
        </div>
        <div
          className="ui actions container"
        >
          <div
            className="ui primary edit icon button"
            onClick={this.editDocument}
            style={{
              display: (
                (this.state.accessMode === editModes.READ) &&
                (this.state.rightId !== 3)
              ) ? 'inline-block' : 'none'
            }}
          >
            <i className="edit icon" />
          </div>
          <div
            className="ui primary save icon button"
            onClick={this.saveDocument}
            style={{
              display: this.state.accessMode === editModes.READ ?
                'none' : 'inline-block'
            }}
          >
            <i className="save icon" />
          </div>
          <div
            className="ui cancel button"
            onClick={this.cancelNewDocument}
            style={{
              display: (this.state.accessMode !== editModes.READ) ?
                'inline-block' : 'none'
            }}
          >
            Cancel
          </div>
          <div
            className="ui close button"
            onClick={this.cancelNewDocument}
            style={{
              display: (this.state.accessMode === editModes.READ) ?
                'inline-block' : 'none'
            }}
          >
            Close
          </div>
        </div>
      </div>
    );
  }
}

DocumentManager.propTypes = {
  saveNewDocument: PropType.func.isRequired,
  user: PropType.shape({
    isAuthenticated: PropType.bool.isRequired,
    id: PropType.number.isRequired,
    email: PropType.string.isRequired,
    username: PropType.string.isRequired,
    firstname: PropType.string.isRequired,
    lastname: PropType.string.isRequired,
    result: PropType.string.isRequired,
    role: PropType.string.isRequired
  }).isRequired,
  createNew: PropType.bool.isRequired,
  rightId: PropType.number.isRequired,
  currentDocument: PropType.shape({
    id: PropType.number,
    title: PropType.string,
    content: PropType.string,
    ownerId: PropType.number,
    accessId: PropType.number
  }),
  cancelNewDocument: PropType.func.isRequired
};

DocumentManager.defaultProps = {
  currentDocument: null
};

const mapDispatchToProps = {
  saveNewDocument,
  cancelNewDocument
};

const mapStateToProps = state => ({
  user: state.user,
  currentDocument: state.documents.currentDocument,
  rightId: state.documents.currentRightId,
  createNew: state.documents.createNew
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentManager);

