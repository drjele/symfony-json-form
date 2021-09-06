<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\SymfonyJsonForm\Traits;

use Drjele\SymfonyJsonForm\Element\AbstractElement;
use Drjele\SymfonyJsonForm\Element\ArrayElement;
use Drjele\SymfonyJsonForm\Element\AutocompleteElement;
use Drjele\SymfonyJsonForm\Element\BoolElement;
use Drjele\SymfonyJsonForm\Element\CollectionElement;
use Drjele\SymfonyJsonForm\Element\DateElement;
use Drjele\SymfonyJsonForm\Element\IntegerElement;
use Drjele\SymfonyJsonForm\Element\StringElement;
use Drjele\SymfonyJsonForm\Exception\Exception;

trait ElementCollectionTrait
{
    /** @var AbstractElement[] */
    private array $elements = [];

    public function addArray(
        string $name,
        string $label,
        array $options,
        string $dataType,
        string $mode
    ): self {
        $element = new ArrayElement($name, $label);

        $element->setOptions($options)
            ->setDataType($dataType)
            ->setMode($mode);

        $this->addElement($element);

        return $this;
    }

    public function addAutocomplete(
        string $name,
        string $label,
        string $route,
        string $dataType,
        string $mode,
        string $queryParam = 'query'
    ): self {
        $element = new AutocompleteElement($name, $label);

        $element->setRoute($route)
            ->setQueryParam($queryParam)
            ->setDataType($dataType)
            ->setMode($mode);

        $this->addElement($element);

        return $this;
    }

    public function addBool(string $name, string $label): self
    {
        $element = new BoolElement($name, $label);

        $this->addElement($element);

        return $this;
    }

    public function addCollection(string $name, string $label): CollectionElement
    {
        $collection = new CollectionElement($name, $label);

        $this->addElement($collection);

        return $collection;
    }

    public function addInteger(string $name, string $label, int $min = null, int $max = null): self
    {
        $element = new IntegerElement($name, $label);

        $element->setMin($min)
            ->setMax($max);

        $this->addElement($element);

        return $this;
    }

    public function addString(string $name, string $label): self
    {
        $element = new StringElement($name, $label);

        $this->addElement($element);

        return $this;
    }

    public function addDate(string $name, string $label, string $format = DateElement::FORMAT_Y_M_D): self
    {
        $element = new DateElement($name, $label);

        $element->setFormat($format);

        $this->addElement($element);

        return $this;
    }

    private function addElement(AbstractElement $element): self
    {
        if (isset($this->elements[$element->getName()])) {
            throw new Exception(\sprintf('duplicate element name "%s"', $element->getName()));
        }

        $this->elements[$element->getName()] = $element;

        return $this;
    }
}
