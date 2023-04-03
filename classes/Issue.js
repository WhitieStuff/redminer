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
    let parent = edit_button.parentNode.parentNode.parentNode
    let timeout = setTimeout(this.check_form_presense.bind(this, parent), 300)
  }

  /** Checks whether the edit form is appended and adds the listeners. */
  check_form_presense(parent) {
    let save_button = parent.querySelector('form[id^=journal-][id$=-form] p input')
    this.modify_save_button(save_button)
    let buttons_row = parent.querySelector('.jstElements')
    let editor_field = parent.querySelector('.jstEditor textarea')
    let old_button = parent.querySelector('.rdm-spoiler')
    if (old_button) return
    this.add_extra_buttons(buttons_row, editor_field)
  }

  /** Makes CLOSE and SAVE buttons mark the edit button as non-pressed. */
  modify_save_button(save_button) {
    let journal_id = `change-${save_button.parentNode.parentNode.id.split('-')[1]}`
    save_button.addEventListener('click', event => {
      setTimeout(this.handle_save_button.bind(this, journal_id), 1000)
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
      let old_button = edit_block.querySelector('.rdm-spoiler')
      if (old_button) return
      this.add_extra_buttons(buttons_row, editor_field)
    })
  }

  /** Adds extra buttons to a form. */
  add_extra_buttons(buttons_row, editor_field) {
    let space = this.create_space()
    let spoiler_button = this.create_toolbar_button('Spoiler', buttons_row, editor_field, this.handle_spoiler_button)
    let link_button = this.create_toolbar_button('Link', buttons_row, editor_field, this.handle_link_button)
    let color_button = this.create_toolbar_button('Color', buttons_row, editor_field, this.handle_color_button)

    buttons_row.appendChild(space)
    buttons_row.appendChild(spoiler_button)
    buttons_row.appendChild(link_button)
    buttons_row.appendChild(color_button)
  }

  /** Creates button with the given params. */
  create_toolbar_button(type, buttons_row, editor_field, handler) {
    /** <button type="button" tabindex="200" class="jstb_h1" title="Heading 1"><span>Heading 1</span></button> */
    let button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('tabindex', 200)
    button.setAttribute('title', type)
    button.classList.add(`rdm-${type.toLowerCase()}`)

    button.addEventListener('click', handler.bind(this, editor_field, buttons_row, button))

    return button
  }

  /** Returns the selection parts in object. */
  get_selection_parts(editor_field) {
    let start = editor_field.selectionStart
    let end = editor_field.selectionEnd
    let value = editor_field.value

    let before = value.substring(0, start)
    let selection = value.substring(start, end)
    let after = value.substring(end, value.length)

    if (!before.length && !selection.length) {
      before = after
      after = ''
    }

    return { before, selection, after }
  }

  /** Handles the spoiler button click. */
  handle_spoiler_button(editor_field) {
    let selection_parts = this.get_selection_parts(editor_field)

    let new_value = `${selection_parts.before}\n{{collapse(Expand)\n${selection_parts.selection}\n}}\n${selection_parts.after}`
    editor_field.value = new_value
  }

  /** Handles the color button click. */
  handle_color_button(editor_field, buttons_row, picker_button) {
    let old_color_picker = buttons_row.parentNode.parentNode.parentNode.querySelector('.rdm-color-picker')
    if (old_color_picker) {
      old_color_picker.remove()
      picker_button.classList.remove('rdm-active')
    } else {
      let color_picker = this.create_color_picker(editor_field, buttons_row, picker_button)
      picker_button.classList.add('rdm-active')
    }
  }

  /** Handles the link button click. */
  handle_link_button(editor_field, buttons_row, editor_button) {
    let old_link_editor = buttons_row.parentNode.parentNode.parentNode.querySelector('.rdm-link-editor')
    if (old_link_editor) {
      old_link_editor.remove()
      editor_button.classList.remove('rdm-active')
    } else {
      let link_editor = this.create_link_editor(editor_field, buttons_row, editor_button)
      editor_button.classList.add('rdm-active')
    }
  }

  /** Returns the space element to implement between buttons. */
  create_space() {
    /** <span id="space4" class="jstSpacer">&nbsp;</span> */
    let space = document.createElement('span')
    space.classList.add('jstSpacer')
    space.innerText = ' '

    return space
  }

  /** Returns the link editor form. */
  create_link_editor(editor_field, buttons_row, editor_button) {
    let parent = buttons_row.parentNode
    let grand_parent = parent.parentNode

    let selection_parts = this.get_selection_parts(editor_field)

    let link_editor = document.createElement('div')
    link_editor.classList.add('rdm-link-editor')

    let link_text_label = this.create_link_editor_label('link_text', 'Text:', ['rdm-link-editor__link-text-label'])
    let link_text_input = this.create_link_editor_input('link_text', selection_parts.selection.trim(), ['rdm-link-editor__link-text-input'])
    let link_href_label = this.create_link_editor_label('link_href', 'Address:', ['rdm-link-editor__link-href-label'])
    let link_href_input = this.create_link_editor_input('link_href', '', ['rdm-link-editor__link-href-input'])

    let paste_button = this.create_link_editor_button('Paste', ['rdm-link-editor__button', 'rdm-link-editor__button_paste'])
    paste_button.addEventListener('click', this.handle_paste_button.bind(this, link_editor, editor_field, editor_button, selection_parts))

    let cancel_button = this.create_link_editor_button('Cancel', ['rdm-link-editor__button', 'rdm-link-editor__button_cancel'])
    cancel_button.addEventListener('click', event => {
      link_editor.remove()
      editor_button.classList.remove('rdm-active')
    })

    link_editor.appendChild(link_text_label)
    link_editor.appendChild(link_text_input)
    link_editor.appendChild(link_href_label)
    link_editor.appendChild(link_href_input)
    link_editor.appendChild(paste_button)
    link_editor.appendChild(cancel_button)

    grand_parent.appendChild(link_editor)
    link_href_input.focus()
  }

  /** Creates a label with given params. */
  create_link_editor_label(label_for = '', label_text = '', label_classes = []) {
    let label = document.createElement('label')
    label.setAttribute('for', label_for)
    label.innerText = label_text
    label_classes.forEach(label_class => {
      label.classList.add(label_class)
    })

    return label
  }

  /** Creates an input with given params. */
  create_link_editor_input(input_id = '', input_value = '', input_classes = []) {
    let input = document.createElement('input')
    input.type = 'text'
    input.setAttribute('name', input_id)
    input.id = input_id
    input.value = input_value
    input_classes.forEach(input_class => {
      input.classList.add(input_class)
    })

    return input
  }

  /** Creates a button with given params. */
  create_link_editor_button(text = '', button_classes = []) {
    let button = document.createElement('button')
    button_classes.forEach(button_class => {
      button.classList.add(button_class)
    })
    button.innerText = text

    return button
  }

  /** Hanles the link editor save button. */
  handle_paste_button(link_editor, editor_field, editor_button, selection_parts) {
    let link_text = link_editor.querySelector('#link_text').value.trim()
    let link_href = link_editor.querySelector('#link_href').value.trim()
    // Adds space if the next part does not start with it so the link would be separated.
    let space = selection_parts.after.match(/^\s/) ? '' : ' '

    let new_value = `${selection_parts.before}"${link_text}":${link_href}${space}${selection_parts.after}`
    editor_field.value = new_value
    
    editor_button.classList.remove('rdm-active')
    link_editor.remove()
  }

  /** Creates color picker. */
  create_color_picker(editor_field, buttons_row, picker_button) {
    let parent = buttons_row.parentNode
    let grand_parent = parent.parentNode

    let color_picker = document.createElement('div')
    color_picker.classList.add('rdm-color-picker')

    let button_red = this.create_color_picker_button(color_picker, editor_field, picker_button, 'Red', '#f00', ['rdm-color-picker__button', 'rdm-color-picker__button_red'])
    let button_green = this.create_color_picker_button(color_picker, editor_field, picker_button, 'Green', '#007f0e', ['rdm-color-picker__button', 'rdm-color-picker__button_green'])
    let button_blue = this.create_color_picker_button(color_picker, editor_field, picker_button, 'Blue', '#0026ff', ['rdm-color-picker__button', 'rdm-color-picker__button_blue'])

    color_picker.appendChild(button_red)
    color_picker.appendChild(button_green)
    color_picker.appendChild(button_blue)

    grand_parent.appendChild(color_picker, parent)
  }

  /** Creates color button. */
  create_color_picker_button(color_picker, editor_field, picker_button, title = '', color = 'transparent', button_classes = []) {
    let selection_parts = this.get_selection_parts(editor_field)

    let button = document.createElement('button')
    button.title = title
    button_classes.forEach(button_class => {
      button.classList.add(button_class)
    })
    button.addEventListener('click', this.handle_color_choose_button.bind(this, color_picker, editor_field, picker_button, selection_parts, color))

    return button
  }

  handle_color_choose_button(color_picker, editor_field, picker_button, selection_parts, color) {
    // Adds space if the next part does not start with it so the link would be separated.
    let space_before = selection_parts.before.match(/\s$/) ? '' : ' '
    let space_after = selection_parts.after.match(/^\s/) ? '' : ' '

    selection_parts.selection = selection_parts.selection.trim().length ? selection_parts.selection.trim() : 'placeholder'

    let new_value = `${selection_parts.before}${space_before}%{color:${color}}${selection_parts.selection}%${space_after}${selection_parts.after}`
    editor_field.value = new_value
    
    picker_button.classList.remove('rdm-active')
    color_picker.remove()
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
