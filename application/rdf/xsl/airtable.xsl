<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
		xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
		xmlns:dc="http://purl.org/dc/elements/1.1/"
		xmlns:dcterms="http://purl.org/dc/terms/"
		xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
		xmlns:sioc="http://rdfs.org/sioc/ns#">

	<!-- Omeka S installs import XSL version 1.0 by Craig Dietrich and Chris Maden -->
	<!-- Makes use of omeka_s.php -->

	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="root/node/node/fields"/>
		</rdf:RDF>
	</xsl:template>

	<xsl:template match="root/node/node/fields">
		<rdf:Description rdf:about="{artfilename/node}">
			<xsl:apply-templates select="*"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="*">
		<xsl:variable name="element-type" select="name(.)"/>
		<xsl:choose>
			<xsl:when test="starts-with($element-type, 'dcterms')">
				<xsl:apply-templates select="." mode="literal-or-nodes">
					<xsl:with-param name="element-type" select="concat('dcterms:',substring-after($element-type,'dcterms'))"/>
				</xsl:apply-templates>
			</xsl:when>
			<xsl:when test="starts-with($element-type, 'art')">
				<xsl:apply-templates select="." mode="literal-or-nodes">
					<xsl:with-param name="element-type" select="concat('art:',substring-after($element-type,'art'))"/>
				</xsl:apply-templates>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template match="*" mode="literal-or-nodes">
		<xsl:param name="element-type"/>
		<xsl:element name="{$element-type}">
			<xsl:value-of select="."/>
		</xsl:element>
	</xsl:template>

</xsl:stylesheet>
