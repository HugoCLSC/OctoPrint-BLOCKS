---
layout: plugin

id: BLOCKS
title: BLOCKSUI
description: Theme for Blocks 3d printers
authors:
- Hugo C. Lopes Santos Costa
license: AGPLv3

# TODO
<!-- date: today's date in format YYYY-MM-DD, e.g. 2015-04-21 -->
date: 2021-08-19

homepage: https://github.com/HugoCLSC/BLOCKSUI
source: https://github.com/HugoCLSC/BLOCKSUI
archive: https://github.com/HugoCLSC/BLOCKSUI/archive/master.zip

# TODO
# Set this to true if your plugin uses the dependency_links setup parameter to include
# library versions not yet published on PyPi. SHOULD ONLY BE USED IF THERE IS NO OTHER OPTION!
#follow_dependency_links: false

# TODO
tags:
- a list
- of tags
- that apply
- to your plugin
- (take a look at the existing plugins for what makes sense here)

# TODO
screenshots:
- url: /assets/img/ScreenShot#1.PNG
  alt: alt-text of a screenshot
  caption: Light
- url:  /assets/img/ScreenShot#2.PNG
  alt: alt-text of another screenshot
  caption: Dark
- url:  /assets/img/ScreenShot#3.PNG
  alt:
  caption: Light connected
- url:  /assets/img/ScreenShot#4.PNG
  alt:
  caption: Dark connected
# TODO
featuredimage: /assets/img/Blocks_Logo.png

# TODO
# You only need the following if your plugin requires specific OctoPrint versions or
# specific operating systems to function - you can safely remove the whole
# "compatibility" block if this is not the case.

compatibility:

  # List of compatible versions
  #
  # A single version number will be interpretated as a minimum version requirement,
  # e.g. "1.3.1" will show the plugin as compatible to OctoPrint versions 1.3.1 and up.
  # More sophisticated version requirements can be modelled too by using PEP440
  # compatible version specifiers.
  #
  # You can also remove the whole "octoprint" block. Removing it will default to all
  # OctoPrint versions being supported.

  octoprint:
  - 1.6.1

  # List of compatible operating systems
  #
  # Valid values:
  #
  # - windows
  # - linux
  # - macos
  # - freebsd
  #
  # There are also two OS groups defined that get expanded on usage:
  #
  # - posix: linux, macos and freebsd
  # - nix: linux and freebsd
  #
  # You can also remove the whole "os" block. Removing it will default to all
  # operating systems being supported.

  os:
  - linux
  - windows
  - macos
  - freebsd

  # Compatible Python version
  #
  # Plugins should aim for compatibility for Python 2 and 3 for now, in which case the value should be ">=2.7,<4".
  #
  # Plugins that only wish to support Python 3 should set it to ">=3,<4".
  #
  # If your plugin only supports Python 2 (worst case, not recommended for newly developed plugins since Python 2
  # is EOL), leave at ">=2.7,<3" - be aware that your plugin will not be allowed to register on the
  # plugin repository if it only support Python 2.

  python: ">=2.7,<4"

---

**TODO**:
# Blocks Plugin

<dd>This Plugin was made with the intention to offer a personalized interface to the users of the Blocks 3D Printers.
The Plugin offers more notifications, a new theme and the ability to change between Light and Dark themes.
</dd>
The plugin is still in development.
http://plugins.octoprint.org/plugin/BLOCKS/
