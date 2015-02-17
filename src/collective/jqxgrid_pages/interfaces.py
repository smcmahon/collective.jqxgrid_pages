# -*- coding: utf-8 -*-
"""Module where all interfaces, events and exceptions live."""

from zope.interface import Interface
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class ICollectiveJqxgridPagesLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class IGridPage(Interface):
        """Explicit marker interface for Grid Page."""
