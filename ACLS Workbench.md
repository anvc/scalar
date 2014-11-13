ACLS Workbench
==============

The ACLS Workbench dashboard, book list, and book theme are designed to be
minimal-impact re-envisioned versions of the default Scalar views.

The primary components of the ACLS Workbench is to easily allow users to clone,
join (or subscribe), create, and view books easily from a slimmed-down
interface.

Built with Bootstrap 3, the design is mobile-friendly and scales to the user's
browser. This makes it easier to write and read Scalar books on the go, and
broadens the number of people that can use the site.



Terminology
-----------

Some basic terms used in the ACLS Workbench should be mentioned prior to
installation and setup:



**Clonable**: Some books within the ACLS Workbench may be "Clonable," meaning
that any user can copy the book and set themselves as the author of the new
content. This allows for 'seed' books which can be built off of without
reimporting all of the common assets.

**Joinable**: Some books within the ACLS Workbench may also be "Joinable,"
meaning that a user can subscribe to the book. A subscribed user can read
content and comment on it, but they cannot produce new content or existing
content. The user may also optionally request to become a co-author. If the user
does make this request, an email is sent to the current authors, and they can
either choose to approve or deny the user



Books may be clonable, joinable, both, or neither.



Installation
------------

If you are cloning a new installation of Scalar, congratulations! You're mostly
done. Perform the standard Scalar installation procedure, then skip ahead to
step 5. Otherwise, follow along:

1.  Download a new copy of Scalar - you can download it as a zip [from
    GitHub][1]

2.  Extract the zip file to a separate directory from your current Scalar
    install (on a different computer, such as your desktop, is fine)

3.  Copy the following directories to your existing Scalar modules view
    directory (.../system/application/views/modules/):

    -   /system/application/views/modules/aclsworkbench_book_list

    -   /system/application/views/modules/aclsworkbench_cover

4.  Copy the following directories to your existing Scalar melons view directory
    (.../system/application/views/melons/):

    -   /system/application/views/melons/aclsworkbench

5.  Inside of your local_settings.php config file (located in:
    [...]/system/application/config/), edit the following items:

    -   **$config['active_melon']** should be changed to **"aclsworkbench"**

    -   **$config['active_book_list']** should be changed to
        **"aclsworkbench_book_list"**

    -   **$config['active_cover']** should be changed to
        **"aclsworkbench_cover"**

6.  Read through the English language file at
    [...]/system/application/language/en/content_lang.php ; many lines starting
    with 'acls' represent text that is present within the ACLS Workbench, and
    can be edited to suit your site's needs.

7.  Your installation of ACLS Workbench should be complete!



Additional Notes
----------------

In order to set a book as clonable or joinable, HTML5 data attributes are used
on the book titles.

### Clonable Books

To set a book as clonable (any user can make a copy of the book), the title of
the book should be:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<span data-duplicatable="true">BOOK TITLE</span>

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

### Joinable Books

To set a book as joinable (any user can subscribe to a book), the title of the
book should be:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<span data-joinable="true">BOOK TITLE</span>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

### Clonable and Joinable Books

To set a book as clonable and joinable (any user can make a copy of the book or
subscribe to it), the title of the book should be:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<span data-duplicatable="true" data-joinable="true">BOOK TITLE</span>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

[1]: <https://github.com/anvc/scalar/archive/master.zip>
