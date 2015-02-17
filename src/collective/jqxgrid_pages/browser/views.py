# -*- coding: UTF-8 -*-
from Products.Five.browser import BrowserView
from plone import api

import logging
logger = logging.getLogger(__name__)


class GridView(BrowserView):
    """ Default view for grid pages.
    """

