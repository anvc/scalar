<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
				xmlns:base="http://example.com/"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- Omeka installs import XSL version 1.0 by Craig Dietrich -->  
    <!-- Makes use of omeka_to_json.php -->                       
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="root/node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="root/node">		
		<rdf:Description rdf:about="http://{archive}/files/show/{id}">
			<dcterms:source><xsl:value-of select="archive" /></dcterms:source>
			<dcterms:date><xsl:value-of select="added" /></dcterms:date>
			<art:filename rdf:resource="{url}" />
			<art:thumbnail rdf:resource="{thumb}" />
			<scalar:num_items><xsl:value-of select="num_items" /></scalar:num_items>
			<dcterms:identifier><xsl:value-of select="filename"/></dcterms:identifier>
			<art:sourceLocation rdf:resource="http://{archive}/files/show/{id}" />
			<xsl:apply-templates select="location_data" />
			<xsl:apply-templates select="tags/node" />
			<xsl:apply-templates select="element_texts/child::*" />
		</rdf:Description>		
	</xsl:template>	
	
	<xsl:template match="location_data">
		<dcterms:spatial><xsl:value-of select="."/></dcterms:spatial>
	</xsl:template>		
	
	<xsl:template match="tags/node">
		<dcterms:subject><xsl:value-of select="name"/></dcterms:subject>
	</xsl:template>	
	
	<xsl:template match="element_texts/child::*">
		<xsl:choose>
			<xsl:when test="name(.) = 'Title'">
				<dcterms:title><xsl:value-of select="."/></dcterms:title>
			</xsl:when>
			<xsl:when test="name(.) = 'Description'">
				<dcterms:description><xsl:value-of select="."/></dcterms:description>
			</xsl:when>		
			<xsl:when test="name(.) = 'Creator'">
				<dcterms:contributor><xsl:value-of select="."/></dcterms:contributor>
			</xsl:when>				
			<xsl:when test="name(.) = 'Source'">
				<dcterms:source><xsl:value-of select="."/></dcterms:source>
			</xsl:when>		
			<xsl:when test="name(.) = 'Date'">
				<dcterms:date><xsl:value-of select="."/></dcterms:date>
			</xsl:when>			
			<xsl:when test="name(.) = 'Coverage'">
				<dcterms:coverage><xsl:value-of select="."/></dcterms:coverage>
			</xsl:when>								
	  </xsl:choose>
	</xsl:template>		 
                
</xsl:stylesheet>                