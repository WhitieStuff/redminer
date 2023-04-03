class Issue {
  constructor() {
    /** Buttons on each editable ticket message. */
    this.edit_buttons = this.get_edit_buttons()
    this.add_edit_buttons_listeners()

    /** Main edit form for new message in ticket. */
    this.issue_form = this.get_issue_form()
    if (!this.issue_form) return
    this.modify_issue_form()
  }

  /** Returns edit buttons of each editable ticket message. */
  get_edit_buttons() {
    let edit_buttons = document.querySelectorAll('a[href^="/journals/"].icon-edit')
    return edit_buttons
  }

  /** Adds listeners on each edit button. */
  add_edit_buttons_listeners() {
    if (!this.edit_buttons || !this.edit_buttons.length) return

    this.edit_buttons.forEach(edit_button => {
      edit_button.addEventListener('click', this.handle_edit_button_click.bind(this, edit_button))
    })
  }

  /** Handles edit button click. */
  handle_edit_button_click(edit_button) {
    // If button has already been pressed.
    if (edit_button.extra_buttons_implemented) return
    // Mark the button as pressed so that it wouldn't work on multi clicks.
    edit_button.extra_buttons_implemented = true
    let parent = edit_button.parentNode.parentNode.parentNode
    let timeout = setTimeout(this.check_form_presense.bind(this, parent, edit_button), 300)
  }

  /** Checks whether the edit form is appended and adds the listeners. */
  check_form_presense(parent, edit_button) {
    let close_buttons = parent.querySelectorAll('form[id^=journal-][id$=-form] p input, form[id^=journal-][id$=-form] p a')
    this.modify_close_buttons(close_buttons, edit_button)
    let buttons_row = parent.querySelector('.jstElements')
    let editor_field = parent.querySelector('.jstEditor textarea')
    this.add_extra_buttons(buttons_row, editor_field)
  }

  /** Makes CLOSE and SAVE buttons mark the edit button as non-pressed. */
  modify_close_buttons(close_buttons, edit_button) {
    close_buttons.forEach(close_button => {
      if (close_button.tagName == 'INPUT') {
        let journal_id = `change-${close_button.parentNode.parentNode.id.split('-')[1]}`
        close_button.addEventListener('click', event => {
          setTimeout(this.handle_save_button.bind(this, journal_id), 1000)
        })
      } else {
        close_button.addEventListener('click', event => {
          edit_button.extra_buttons_implemented = false
        })
      }
    })
  }

  /** Handles the save button click and readds the listener to edit button. */
  handle_save_button(journal_id) {
    let edit_button = document.querySelector(`#${journal_id} a[href^="/journals/"].icon-edit`)
    edit_button.addEventListener('click', this.handle_edit_button_click.bind(this, edit_button))
  }

  /** Returns the main ticket form. */
  get_issue_form() {
    let form = document.querySelector('#issue-form')
    return form
  }

  /** Modifies the main ticket form. */
  modify_issue_form() {
    let edit_blocks = this.issue_form.querySelectorAll('.jstBlock')
    edit_blocks.forEach(edit_block => {
      let buttons_row = edit_block.querySelector('.jstElements')
      let editor_field = edit_block.querySelector('.jstEditor textarea')
      this.add_extra_buttons(buttons_row, editor_field)
    })
  }

  /** Adds extra buttons to a form. */
  add_extra_buttons(buttons_row, editor_field) {
    let space = this.create_space()
    let spoiler_button = this.create_button('spoiler', buttons_row, editor_field, this.handle_spoiler_button)
    let link_button = this.create_button('link', buttons_row, editor_field, this.handle_link_button)

    buttons_row.appendChild(space)
    buttons_row.appendChild(spoiler_button)
    buttons_row.appendChild(link_button)
  }

  /** Creates button with the given params. */
  create_button(type, buttons_row, editor_field, handler) {
    /** <button type="button" tabindex="200" class="jstb_h1" title="Heading 1"><span>Heading 1</span></button> */
    let button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('tabindex', 200)
    button.setAttribute('title', type)
    button.classList.add(`rdm-${type}`)
    button.link_editor_implemented = false

    button.addEventListener('click', handler.bind(this, editor_field, buttons_row, button))

    return button
  }

  /** Handles the spoiler button click. */
  handle_spoiler_button(editor_field) {
    let value = '\n{{collapse(Expand)\n\n}}'
    editor_field.value += value
  }

  /** Handles the link button click. */
  handle_link_button(editor_field, buttons_row, button) {
    if (button.link_editor_implemented) return
    let link_modal = this.create_link_editor(editor_field, buttons_row, button)
    button.link_editor_implemented = true
  }

  /** Returns the space element to implement between buttons. */
  create_space() {
    /** <span id="space4" class="jstSpacer">&nbsp;</span> */
    let space = document.createElement('span')
    // space.id = 'space5'
    space.classList.add('jstSpacer')
    space.innerText = ' '

    return space
  }

  /** Returns the link editor form. */
  create_link_editor(editor_field, buttons_row, button) {
    let parent = buttons_row.parentNode
    let grand_parent = parent.parentNode

    let link_editor = document.createElement('div')
    link_editor.classList.add('rdm-link_editor')

    let link_text_label = document.createElement('label')
    link_text_label.setAttribute('for', 'link_text')
    link_text_label.classList.add('rdm-link-editor__link-text-label')
    link_text_label.innerText = 'Text:'

    let link_text_input = document.createElement('input')
    link_text_input.type = 'text'
    link_text_input.setAttribute('name', 'link_text')
    link_text_input.id = 'link_text'
    link_text_input.classList.add('rdm-link-editor__link-text-input')

    let link_href_label = document.createElement('label')
    link_href_label.setAttribute('for', 'link_href')
    link_href_label.classList.add('rdm-link-editor__link-href-label')
    link_href_label.innerText = 'Address:'

    let link_href_input = document.createElement('input')
    link_href_input.type = 'text'
    link_href_input.setAttribute('name', 'link_href')
    link_href_input.id = 'link_href'
    link_href_input.classList.add('rdm-link-editor__link-href-input')

    let paste_button = document.createElement('button')
    paste_button.classList.add('rdm-link-editor__button')
    paste_button.classList.add('rdm-link-editor__button_paste')
    paste_button.innerText = 'Paste'
    paste_button.addEventListener('click', this.handle_paste_button.bind(this, link_editor, editor_field, button))

    let cancel_button = document.createElement('button')
    cancel_button.classList.add('rdm-link-editor__button')
    cancel_button.classList.add('rdm-link-editor__button_cancel')
    cancel_button.innerText = 'Cancel'
    cancel_button.addEventListener('click', this.handle_close_editor.bind(this, link_editor, button))

    link_editor.appendChild(link_text_label)
    link_editor.appendChild(link_text_input)
    link_editor.appendChild(link_href_label)
    link_editor.appendChild(link_href_input)
    link_editor.appendChild(paste_button)
    link_editor.appendChild(cancel_button)

    grand_parent.appendChild(link_editor, parent)
  }

  /** Handes the link editor close cccbutton. */
  handle_close_editor(link_editor, button) {
    button.link_editor_implemented = false
    link_editor.remove()
  }

  /** Hanles the link editor save button. */
  handle_paste_button(link_editor, editor_field, button) {
    let link_text = link_editor.querySelector('#link_text').value
    let link_href = link_editor.querySelector('#link_href').value

    let value = `"${link_text}":${link_href}`
    editor_field.value += value
    this.handle_close_editor(link_editor, button)
  }

  // create_modal(type, editor_field) {
  //   let modal = document.createElement('div')
  //   modal.classList.add('rdm-modal')
  //   modal.classList.add(`rdm-modal_${type}`)
  //   modal.id = `rdm-${type}`

  //   let modal_content = type == 'link' ? this.create_modal_content_link() : this.create_modal_content_table()

  //   let close_button = document.createElement('div')
  //   close_button.classList.add('rdm-modal__close')
  //   close_button.innerText = '+'
  //   close_button.addEventListener('click', this.handle_close_editor.bind(this, modal))

  //   let buttons_row = document.createElement('div')
  //   buttons_row.classList.add('rdm-link-editor__buttons')

  //   let paste_button = document.createElement('button')
  //   paste_button.classList.add('rdm-link-editor__button')
  //   paste_button.classList.add('rdm-link-editor__button_paste')
  //   paste_button.innerText = 'Paste'
  //   paste_button.addEventListener('click', this.handle_paste_button.bind(this, modal, editor_field))

  //   let cancel_button = document.createElement('button')
  //   cancel_button.classList.add('rdm-link-editor__button')
  //   cancel_button.classList.add('rdm-link-editor__button_cancel')
  //   cancel_button.innerText = 'Cancel'
  //   cancel_button.addEventListener('click', this.handle_close_editor.bind(this, modal))

  //   buttons_row.appendChild(cancel_button)
  //   buttons_row.appendChild(paste_button)
  //   modal_content.appendChild(buttons_row)
  //   modal.appendChild(modal_content)
  //   modal.appendChild(close_button)
  //   document.querySelector('body').appendChild(modal)
  // }

  // create_modal_content_table() {}
}
