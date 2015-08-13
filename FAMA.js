(function() {
  'ForumActif Mobile Actions';
  window.$FAMA = {
   
    lang : {
      title_reply : '<b>Post a reply</b>',
      title_edit : '<b>Edit post</b>',
     
      status_progress : 'Sending, please wait...',
      status_done : function(url) {
        return 'Your message has been submitted successfully. Please <a href="' + url + '">click here</a> if you\'re not redirected.'
      },
      status_fail : 'An error has occurred, please try again later.',
     
      delete_warning : 'Are you sure you want to delete this post ?',
      delete_done : 'The message has been deleted successfully.',
      delete_fail : 'The message could not be deleted, please try again later.',
     
      textarea_placeholder : 'Message body..',
      button_submit : 'Submit'
    },
   
    node : null,
   
    id : window.location.href.replace(/.*?\/t(\d+).*/, '$1'),
   
    store : new Object(),
   
    create : function(node, href) {
      var form = document.createElement('form');
      form.action = '/post';
      form.method = 'post';
      form.name = 'post';
      form.id = 'mobile_editor';
      form.innerHTML = '<div id="editor_title" class="post_header"></div><div id="text_box"><textarea placeholder="' + $FAMA.lang.textarea_placeholder + '" name="message"></textarea></div><div><input type="submit" value="' + $FAMA.lang.button_submit + '" name="post" class="defaultBtn"/><div id="post_status" style="display:none"></div></div><div id="mobile_data" style="display:none"></div>';
     
      form.onsubmit = function(e) {
        var t = this,
            data = $(t).serialize() + '&post=1',
            status = document.getElementById('post_status');
       
        t.post.style.display = 'none';
        status.style.display = 'block';
        status.className = 'post_progress';
        status.innerHTML = $FAMA.lang.status_progress;
       
        e.preventDefault();
       
        $.post('/post', data, function(d) {
          var redir = d.match(/.*content="\d;url=(.*?)".*/i, '$1'),
              url = (redir && redir[1]) ? redir[1].replace(/&amp;/g, '&') : window.location.pathname + (/mode=reply/.test(data) ? '?view=newest' : '');
             
          status.className = 'post_done';
          status.innerHTML = $FAMA.lang.status_done(url);
         
          window.setTimeout(function() {
            window.location.href = url;
          }, 1500);
         
        }).fail(function() {
          status.className = 'post_fail';
          status.innerHTML = $FAMA.lang.status_fail;
          t.post.style.display = '';
        });
      };
     
     
      $FAMA.node = form;
      $FAMA.change(node, href);
    },
   
    change : function(node, href) {
      node.appendChild($FAMA.node);
     
      if ($FAMA.node.mode) {
        var oldid = document.getElementById('old_post_id');
        if ($FAMA.node.mode.value == 'reply' && oldid)  {
          if (!$FAMA.store['post_' + oldid.value]) $FAMA.store['post_' + oldid.value] = new Object();
          $FAMA.store['post_' + oldid.value].reply = $FAMA.node.message.value;
        }
        else if ($FAMA.node.mode.value == 'editpost' && $FAMA.node.p) {
          if (!$FAMA.store['post_' + $FAMA.node.p.value]) $FAMA.store['post_' + $FAMA.node.p.value] = new Object();
          $FAMA.store['post_' + $FAMA.node.p.value].editpost = $FAMA.node.message.value;
        }
      }
     
      $FAMA.node.message.value = '';
     
      var mode = href.replace(/.*?mode=(.*)/, '$1'),
          pid = href.replace(/.*?p=(\d+).*/, '$1'),
          data = document.getElementById('mobile_data'),
          title = document.getElementById('editor_title');
     
     
      if (mode == 'quote') {
        if ($FAMA.store['post_' + pid] && $FAMA.store['post_' + pid].reply) $FAMA.node.message.value = $FAMA.store['post_' + pid].reply;
        title.innerHTML = $FAMA.lang.title_reply;
        data.innerHTML = '<input id="old_post_id" type="hidden" value="' + pid + '"/><input type="hidden" name="mode" value="reply"/><input type="hidden" name="t" value="' + $FAMA.id + '"/>';
      } else {
        if ($FAMA.store['post_' + pid] && $FAMA.store['post_' + pid].editpost) $FAMA.node.message.value = $FAMA.store['post_' + pid].editpost;
        title.innerHTML = $FAMA.lang.title_edit;
        data.innerHTML = '<input type="hidden" name="mode" value="editpost"/><input type="hidden" name="p" value="' + pid + '"/>';
      }

      $.get(href, function(d) {
        var titre = $('input[name="subject"]', d)[0],
            editer = $('input[name="edit_reason"]', d)[0];
        
        $('input[name="auth[]"]', d).appendTo(data);
        if (!$FAMA.node.message.value) $FAMA.node.message.value = $('#text_editor_textarea', d)[0].value;
        if (titre && titre.value) data.appendChild(titre);
        if (editer && editer.value) data.appendChild(editer);
      });
    }
   
  };
 
  for (var a = document.getElementsByTagName('A'), i = 0, j = a.length; i < j; i++) {
    if (/mobile-actions/.test(a[i].parentNode.parentNode.className)) {
      if (/mode=(?:quote|editpost)/.test(a[i].href)) {
        a[i].onclick = function(e) {
          var node = this.parentNode.parentNode.parentNode, href = this.href;
          e.preventDefault();
          $FAMA.node ? $FAMA.change(node, href) : $FAMA.create(node, href);
        };
      } else if (/mode=delete/.test(a[i].href)) {
        a[i].onclick = function(e) {
          var del = confirm($FAMA.lang.delete_warning);

          if (del) {
            $.post('/post', 'p=' + this.href.replace(/.*?p=(\d+).*/, '$1') + '&mode=delete&confirm=1', function(d) {
              alert($FAMA.lang.delete_done);
              window.location.reload();
            }).fail(function() {
              alert($FAMA.lang.delete_fail);
            });
          }
         
          e.preventDefault();
        };
      }
    }
  }
})();
