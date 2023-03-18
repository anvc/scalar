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
			<xsl:apply-templates select="root/node"/>
		</rdf:RDF>
	</xsl:template>

	<xsl:template match="*">
		<xsl:variable name="element-type" select="name(.)"/>
		<xsl:choose>
			<xsl:when test="starts-with($element-type, 'dcterms')">
				<xsl:apply-templates select="." mode="literal-or-nodes">
					<xsl:with-param name="element-type"
						select="concat('dcterms:',substring-after($element-type,'dcterms'))"/>
				</xsl:apply-templates>
			</xsl:when>
			<xsl:when test="starts-with($element-type, 'rdf')">
				<xsl:apply-templates select="." mode="literal-or-nodes">
					<xsl:with-param name="element-type"
						select="concat('rdf:',substring-after($element-type,'rdf'))"/>
				</xsl:apply-templates>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="root/node">
		<rdf:Description rdf:about="{id}">
			<dcterms:source>
				<xsl:choose>
					<xsl:when test="osource and osource != ''">
						<xsl:value-of select="osource"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="archive"/>
					</xsl:otherwise>
				</xsl:choose>
			</dcterms:source>
			<xsl:apply-templates select="*"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template
		match="archive |
			context |
			data |
			id |
			oid |
			oingester |
			oispublic |
			oitem |
			oowner |
			orenderer |
			oresource_class |
			oresource_template |
			osha256 |
			osource"/>

	<xsl:template match="dctermscontributor">
		<xsl:apply-templates select="." mode="literal-or-nodes">
			<xsl:with-param name="element-type" select="'dcterms:contributor'"/>
		</xsl:apply-templates>
		<xsl:if test="not(../dctermscreator)">
			<xsl:apply-templates select="." mode="literal-or-nodes">
				<xsl:with-param name="element-type" select="'dcterms:creator'"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>

	<xsl:template match="dctermscreated">
		<xsl:apply-templates select="." mode="literal-or-nodes">
			<xsl:with-param name="element-type" select="'dcterms:created'"/>
		</xsl:apply-templates>
		<xsl:if test="not(../dctermsdate)">
			<xsl:apply-templates select="." mode="literal-or-nodes">
				<xsl:with-param name="element-type" select="'dcterms:date'"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>

	<xsl:template match="dctermsformat">
		<xsl:apply-templates select="." mode="literal-or-nodes">
			<xsl:with-param name="element-type" select="'dcterms:format'"/>
		</xsl:apply-templates>
		<xsl:if test="not(../rdfformat)">
			<xsl:apply-templates select="." mode="literal-or-nodes">
				<xsl:with-param name="element-type" select="'rdf:format'"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>

	<xsl:template match="dctermsmodified">
		<xsl:apply-templates select="." mode="literal-or-nodes">
			<xsl:with-param name="element-type" select="'dcterms:modified'"/>
		</xsl:apply-templates>
		<xsl:if test="not(../dctermsdate) and not(../dctermscreated)">
			<xsl:apply-templates select="." mode="literal-or-nodes">
				<xsl:with-param name="element-type" select="'dcterms:date'"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>

	<xsl:template match="ocreated">
		<xsl:if test="not(../dctermscreated)">
			<dcterms:created>
				<xsl:value-of select="value"/>
			</dcterms:created>
			<xsl:if test="not(../dctermsdate)">
				<dcterms:date>
					<xsl:value-of select="value"/>
				</dcterms:date>
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template match="ofilename">
		<dcterms:identifier>
			<xsl:value-of select="."/>
		</dcterms:identifier>
	</xsl:template>

	<xsl:template match="olang">
		<xsl:if test=". != '' and not(../dctermslanguage)">
			<dcterms:language>
				<xsl:value-of select="."/>
			</dcterms:language>
		</xsl:if>
	</xsl:template>

	<xsl:template match="omedia_type">
		<xsl:if test="not(../dctermsformat) and not(../rdfformat)">
			<dcterms:format>
				<xsl:value-of select="."/>
			</dcterms:format>
			<rdf:format>
				<xsl:value-of select="."/>
			</rdf:format>
		</xsl:if>
	</xsl:template>

	<xsl:template match="omodified">
		<xsl:if test="not(../dctermsmodified)">
			<dcterms:modified>
				<xsl:value-of select="value"/>
			</dcterms:modified>
			<xsl:if test="not(../dctermsdate) and not(../dctermscreated) and not(../ocreated)">
				<dcterms:date>
					<xsl:value-of select="value"/>
				</dcterms:date>
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template match="ooriginal_url">
		<art:filename rdf:resource="{.}"/>
	</xsl:template>

	<xsl:template match="othumbnail_urls">
		<art:thumbnail>
			<xsl:attribute name="rdf:resource">
				<xsl:choose>
					<xsl:when test="square">
						<xsl:value-of select="square"/>
					</xsl:when>
					<xsl:when test="medium">
						<xsl:value-of select="medium"/>
					</xsl:when>
					<xsl:when test="large">
						<xsl:value-of select="large"/>
					</xsl:when>
				</xsl:choose>
			</xsl:attribute>
		</art:thumbnail>
	</xsl:template>

	<xsl:template match="rdfformat">
		<xsl:apply-templates select="." mode="literal-or-nodes">
			<xsl:with-param name="element-type" select="'rdf:format'"/>
		</xsl:apply-templates>
		<xsl:if test="not(../dctermsformat)">
			<xsl:apply-templates select="." mode="literal-or-nodes">
				<xsl:with-param name="element-type" select="'dcterms:format'"/>
			</xsl:apply-templates>
		</xsl:if>
	</xsl:template>

	<xsl:template match="type">
		<xsl:variable name="rdftype" select="boolean(../rdftype)"/>
		<xsl:choose>
			<xsl:when test="count(*) = 0">
				<xsl:apply-templates select="." mode="handle-types">
					<xsl:with-param name="rdftype" select="$rdftype"/>
				</xsl:apply-templates>
			</xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="node/value" mode="handle-types">
					<xsl:with-param name="rdftype" select="$rdftype"/>
				</xsl:apply-templates>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="*" mode="handle-types">
		<xsl:param name="rdftype" select="true()"/>
		<xsl:if test=". != 'o:Media'">
			<dcterms:type>
				<xsl:value-of select="."/>
			</dcterms:type>
			<xsl:if test="not($rdftype)">
				<rdf:type>
					<xsl:value-of select="."/>
				</rdf:type>
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template match="*" mode="literal-or-nodes">
		<xsl:param name="element-type"/>
		<xsl:choose>
			<xsl:when test="count(*) = 0">
				<xsl:element name="{$element-type}">
					<xsl:value-of select="."/>
				</xsl:element>
			</xsl:when>
			<xsl:when test="node">
				<xsl:for-each select="node">
					<xsl:element name="{$element-type}">
						<xsl:if test="language">
							<xsl:attribute name="xml:lang">
								<xsl:value-of select="language"/>
							</xsl:attribute>
						</xsl:if>
						<xsl:if test="id">
							<xsl:attribute name="rdf:resource">
								<xsl:value-of select="id"/>
							</xsl:attribute>
						</xsl:if>
						<xsl:choose>
							<xsl:when test="value">
								<xsl:value-of select="value"/>
							</xsl:when>
							<xsl:when test="display_title">
								<xsl:value-of select="display_title"/>
							</xsl:when>
							<xsl:when test="olabel">
								<xsl:value-of select="olabel"/>
							</xsl:when>
						</xsl:choose>
					</xsl:element>
				</xsl:for-each>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
