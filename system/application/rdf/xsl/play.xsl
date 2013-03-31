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
                            
    <!-- PLAY! import XSL version 1.0 by Craig Dietrich -->                        
      
   	<xsl:variable name="archiveName">
		<xsl:text>PLAY!</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="//node">	
		<xsl:variable name="url">
	  		<xsl:choose>	
				<xsl:when test="substring(EmbedUrl,0,8)='http://'">
					<xsl:value-of select="EmbedUrl" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>http://</xsl:text>
					<xsl:value-of select="EmbedUrl" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>	 
		<xsl:variable name="sourceLocation">
	  		<xsl:choose>	
				<xsl:when test="substring(PlayUrl,0,8)='http://'">
					<xsl:value-of select="PlayUrl" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>http://</xsl:text>
					<xsl:value-of select="PlayUrl" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>	 		
		<xsl:variable name="thumbnail">
	  		<xsl:choose>	
				<xsl:when test="contains(Thumbnail,'CustomImages/noThumbnail.jpg')"></xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="Thumbnail" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>	 			
		<rdf:Description rdf:about="{$url}">
			<dcterms:source><xsl:value-of select="$archiveName" /></dcterms:source>
			<art:filename rdf:resource="{$url}" />
			<art:thumbnail rdf:resource="{$thumbnail}" />
			<art:sourceLocation rdf:resource="{$sourceLocation}" />
			<dcterms:title><xsl:value-of select="Title" /></dcterms:title>
			<dcterms:description><xsl:value-of select="Description" /></dcterms:description>
			<dcterms:contributor><xsl:value-of select="Author" /></dcterms:contributor>				
		</rdf:Description>		
	</xsl:template>		 
                
</xsl:stylesheet>                